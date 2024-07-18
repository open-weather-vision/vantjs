import { SerialPort } from "serialport";
import { CRC } from "crc-full";
import { TypedEmitter } from "tiny-typed-emitter";
import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";
import {sleep} from "vant-environment/utils";

import {
    BasicRealtimeData,
    HighsAndLows,
    LOOP1,
    LOOP2,
} from "vant-environment/structures";
import { defaultUnitSettings } from "vant-environment/units";
import {
    FailedToWakeUpError,
    SerialPortError,
    MalformedDataError,
    ClosedConnectionError,
    VantError,
} from "../errors/index.js";
import flatMerge from "../util/flatMerge.js";
import {
    parseHighsAndLows,
    parseLOOP1,
    parseLOOP2,
    createRainClicksToInchTransformer,
    createUnitTransformers,
    UnitTransformers,
} from "../parsers/index.js";
import { EasyBuffer, Type } from "@harrydehix/easy-buffer";
import TimeoutError from "../errors/TimeoutError.js";
import { MinimumWeatherStationSettings, WeatherStationSettings } from "./settings/index.js";
import WeatherStationEventBase from "./WeatherStationEventBase.js";
import { time } from "console";
import BetterSerialPort from "../util/BetterSerialPort.js";
import BasicRealtimeDataContainer from "../realtime-containers/BasicRealtimeDataContainer.js";
import { MinimumRealtimeDataContainerSettings } from "../realtime-containers/settings/MinimumRealtimeDataContainerSettings.js";
import WeatherStationAdvanced from "./WeatherStationAdvanced.js";

/**
 * Interface to _any vantage weather station_ (Vue, Pro, Pro 2). Provides useful methods to access realtime weather data from your weather station's
 * console. The device must be connected serially.
 * To interact with your weather station create an instance of this class using {@link WeatherStation.connect}.
 *
 * The WeatherStation is an [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter). The events fired by the interface are described {@link WeatherStationEvents here}.
 *
 * This interface is limited to station independent features.
 * Use {@link WeatherStationAdvanced} for station dependent features.
 */
export default class WeatherStation extends WeatherStationEventBase {
    /**
     * The serial port connection used internally.
     * @hidden
     */
    protected readonly port: BetterSerialPort;

    /**
     * A singleton for the basic realtime data container.
     */
    protected basicRealtimeContainer: BasicRealtimeDataContainer | null = null;

    /** 
     * Whether _vantjs_ tries to stay connected to the console.
     * After calling `connect()` this returns `true`, after calling `disconnect()` this returns `false`.
     * @hidden
     */
    protected wantsToBeConnected: boolean = false;

    /**
     * The crc type used internally to validate transmitted packages.
     * @hidden
     */
    protected readonly crc16 = CRC.default("CRC16_CCIT_ZERO") as CRC;

    /**
     * Transforms rain clicks to inch.
     * @hidden
     */
    protected readonly rainClicksToInchTransformer: (
        rainClicks: number
    ) => number;

    protected readonly unitTransformers: UnitTransformers;

    /** This attribute stores the time of the latest successfull console communcation. Used to determine if the console needs to be woken up again. @hidden */
    private latestConsoleCommunicationTime : Date | null = null;

    /**
     * The WeatherStation's default settings.
     */
    public static readonly defaultSettings: WeatherStationSettings = {
        baudRate: 19200,
        units: defaultUnitSettings,
        reconnectionInterval: 1000,
        path: "",
        rainCollectorSize: "0.01in",
        defaultTimeout: 1000,
    };

    /**
     * The used interface settings. These control the addressed serialport, the baud rate, the
     * used units, etc. They are immutable.
     *
     * @see WeatherStationSettings
     */
    public readonly settings: WeatherStationSettings;

    /**
     * Whether the interface is currently connected to the weather station.
     */
    public get connected() {
        return this._connected;
    }

    /**
     * Creates a connection to your vantage console (Vue, Pro, Pro 2) using the passed settings (see {@link MinimumWeatherStationSettings}). The device should be connected
     * serially. Throws an error if connecting fails.
     *
     * Weather station dependent functionality (e.g. firmware version code for Vantage Pro 2 / Vue) is not supported on this interface.
     * Use {@link WeatherStationAdvanced} for more features.
     *
     * @example
     * ```typescript
     * const device = await WeatherStation.connect({ path: "COM3", rainCollectorSize: "0.2mm" });
     *
     * const [highsAndLows, err] = await device.getHighsAndLows();
     * inspect(highsAndLows);
     *
     * await device.disconnect();
     * ```
     * @param settings the interface settings
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link FailedToWakeUpError} if the interface failed to wake up the console
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public static async connect(settings: MinimumWeatherStationSettings) {
        const device = new WeatherStation(settings);

        await device.port.open();
        await device.wakeUp();

        return device;
    }

    /**
     * Reconnects to the weather station (opens the serial connection and wakes the station up).
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link FailedToWakeUpError} if the interface failed to wake up the console
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public reconnect = async (timeout?: number) => {
        await this.port.open();
        await this.wakeUp(timeout);
    };


    /**
     * Creates a new interface. Merges the passed settings with the default ones, prepares the internally used serial port connection and
     * configures the `"close"` and `"open"` event. Doesn't perform the configured {@link OnInterfaceCreate} action.
     * @param settings the interface settings to use
     * @hidden
     */
    protected constructor(settings: MinimumWeatherStationSettings) {
        super();

        this.settings = merge(
            cloneDeep(WeatherStation.defaultSettings),
            settings
        );

        this.rainClicksToInchTransformer = createRainClicksToInchTransformer(
            this.settings.rainCollectorSize
        );

        this.unitTransformers = createUnitTransformers(this.settings.units);

        this.port = new BetterSerialPort({
            path: this.settings.path,
            baudRate: this.settings.baudRate,
        });

        this.wantsToBeConnected = true;

        this.port.on("disconnect", () => {
            this.latestConsoleCommunicationTime = null;
            this.emit("disconnect");
            if(this.wantsToBeConnected) this.startReconnecting();
        });

        this.on("connect", () => {
            this._connected = true;
        });
        this.on("disconnect", () => {
            this._connected = false;
        })
    }

    /**
     * Tries to reconnect to the console by opening the serial port and waking the station up. If this fails it automatically
     * tries again after {@link this.settings.reconnectionInterval}.
     * @hidden
     */
    private startReconnecting = async () => {
        if(this.wantsToBeConnected){
            await sleep(this.settings.reconnectionInterval);
            try {
                await this.port.open();
                await this.wakeUp();
            } catch (err: any) {
                this.startReconnecting();
            }
        }
    };

    /**
     * Write the passed data to the serialport and waits for a buffer with the passed byte size. If the data is received in split packages, the data gets concatenated.
     * @param chunk the data to write to the serialport
     * @param expectedBufferSize the expected byte size of the buffer
     * @returns the buffer having the expected size
     * @throws a {@link TimeoutError} (timeout exceeded)
     * @throws a {@link SerialPortError} (error while writing)
     * @throws a {@link ClosedConnectionError} (connection has been suddenly closed)
     * @hidden
     */
    protected writeAndWaitForBuffer = async(
        chunk: any,
        expectedBufferSize: number,
        timeout: number | undefined = this.settings.defaultTimeout
    ) => {
        await this.port.write(chunk);
        return await this.port.waitForData(expectedBufferSize, timeout);
    };

    /**
     * Splits a buffer received from the console into the acknowledgement byte, the weather data itself and the two crc bytes.
     * @param buffer
     * @returns the buffer split in thee pieces (acknowledgement byte, the weather data itself, the two crc bytes)
     * @throws a {@link MalformedDataError} if the passed buffer is malformed
     * @hidden
     */
    protected splitCRCAckDataPackage = (buffer: Buffer) => {
        try {
            const bufferCopy = Buffer.alloc(buffer.length - 3);
            buffer.copy(bufferCopy, 0, 1, buffer.length - 2);
            return {
                ack: buffer.readUInt8(0),
                data: bufferCopy,
                crc: buffer.readUInt16BE(buffer.length - 2),
            };
        } catch (err: any) {
            throw new MalformedDataError(
                "Received malformed data! Failed to split the received buffer: " +
                    err.message
            );
        }
    };

    /**
     * Removes the first byte (the acknowledgement byte) from the buffer.
     * @hidden
     */
    protected removeAcknowledgementByte = (buffer: Buffer) => {
        try {
            const bufferCopy = Buffer.alloc(buffer.length - 1);
            buffer.copy(bufferCopy, 0, 1, buffer.length);
            return bufferCopy;
        } catch (err: any) {
            throw new MalformedDataError(
                "Received malformed data! Failed to remove acknowledgement byte: " +
                    err.message
            );
        }
    };

    /**
     * Validates the acknowledgement byte (first byte) of an buffer received from the vantage console.
     * @param buffer
     * @throws a {@link MalformedDataError} if the acknowledgement byte is invalid or the received buffer is malformed
     * @hidden
     */
    protected validateAcknowledgementByte = (buffer: Buffer) => {
        try {
            const ack = buffer.readUInt8(0);
            if (ack == 0x06 || ack == 0x15) return;
        } catch (err: any) {
            throw new MalformedDataError(
                "Received malformed data! Failed to validate the acknowledgement byte: " +
                    err.message
            );
        }
        throw new MalformedDataError("Received invalid acknowledgement byte!");
    };

    /**
     * Computes the CRC value from the given buffer. Based on the CRC16_CCIT_ZERO standard.
     * @param buffer
     * @returns the computed CRC value (2 byte, 16 bit)
     * @hidden
     */
    protected computeCRC = (buffer: Buffer) => {
        return this.crc16.compute(buffer);
    };

    /**
     * Validates a buffer by computing its CRC value and comparing it to the exspected CRC value.
     * @param buffer
     * @param exspectedCRC
     * @throws a {@link MalformedDataError} if the CRC value is invalid
     * @hidden
     */
    protected validateCRC = (buffer: Buffer, exspectedCRC: number) => {
        const crc = this.computeCRC(buffer);
        if (exspectedCRC === crc) return;
        else
            throw new MalformedDataError(
                "Received invalid CRC value. An error occurred during data transmission. Received malformed data."
            );
    };

    protected checkConsoleConnection = (timeout: number | undefined = this.settings.defaultTimeout, wakeUp: boolean = true) => {
        return new Promise<void>((resolve, reject) => {
            if(typeof timeout === "number"){
                setTimeout(() => {
                    this.removeListener("connect", resolve);
                    reject(new TimeoutError(timeout));
                }, timeout);
            }
            if(this.port.connectionState === "connected"){
                if(!this.isConsoleAwake() && wakeUp){
                    this.wakeUp().then(() => resolve());
                }else{
                    resolve();
                }
            }else{
                this.once("connect", resolve);
            }
        })
    }

    /** 
     * Checks if the last communication happended `90s` or less ago.
     * @hidden
     */
    protected isConsoleAwake(){
        return this.latestConsoleCommunicationTime !== null && ((new Date().getTime() - this.latestConsoleCommunicationTime.getTime()) / 1000) <= 90;
    }

    /**
     * Registers a successfull console communication. This information is used to check if one needs to wake up the station again.
     * @hidden
     */
    protected registerSuccessfullConsoleCommunication = () => {
        this.latestConsoleCommunicationTime = new Date();
    };

    /**
     * Wakes up the vantage console. This is necessary in order to send and receive data. The console automatically
     * falls asleep after two minutes of inactivity and needs to be woken up again. The interface handels this automatically
     * inside the `checkConsoleConnection()` method.
     *
     * Fires the {@link WeatherStationEvents.connect} event if the console wakes up.
     *
     * @throws a {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @throws a {@link FailedToWakeUpError} if the console doesn't wake up after trying three times
     * @throws a {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @hidden
     */
    protected wakeUp = async (timeout?: number) => {
        await this.checkConsoleConnection(timeout, false);
        let succeeded = false;
        let tries = 0;
        do {
            let data: Buffer;
            try{
                data = await this.writeAndWaitForBuffer("\n", 2);
            }catch(err){
                throw new FailedToWakeUpError();
            }
            if (data.toString("ascii") === "\n\r") {
                succeeded = true;
                this.registerSuccessfullConsoleCommunication();
                this.emit("connect");
            } else {
                succeeded = false;
            }
            tries++;
        } while (!succeeded && tries <= 3);
        if (!succeeded) {
            throw new FailedToWakeUpError();
        }
    };

    /**
     * Validates the connection to the console by running the `TEST` command. No error is thrown on failure, instead `false` is resolved.
     * @returns whether the connection is valid
     */
    public checkConnection = async (timeout?: number): Promise<boolean> => {
        try {
            await this.checkConsoleConnection(timeout);
            const data = await this.writeAndWaitForBuffer("TEST\n", 8, timeout);
            const testSuccessfull = data.toString("ascii").includes("TEST");
            if(testSuccessfull) this.registerSuccessfullConsoleCommunication();
            return testSuccessfull;
        } catch (err: any) {
            return false;
        }
    };


    /**
     * Gets the console's firmware date code in the `"Month dd yyyy"` format (e.g. `"Sep 12 2017"`).
     * @returns the console's firmware date code
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getFirmwareDateCode = async (timeout?: number): Promise<
        [string, undefined] | [null, VantError]
    > => {
        try{
            await this.checkConsoleConnection(timeout);
        }catch(err){
            return [null, err as VantError];
        }

        let data: Buffer;
        try{
            data = await this.writeAndWaitForBuffer("VER\n", 19, timeout);
        }catch(err: any){
            return [null, err];
        }
        try {
            const result = data.toString("ascii").split("OK")[1].trim();
            this.registerSuccessfullConsoleCommunication();
            return [result, undefined];
        } catch (err) {
            return [null, new MalformedDataError("Received malformed data")];
        }
    };

    /**
     * Closes the connection to the weather station (if it's open). Throws no error if the connection is already closed.
     *
     * @throws a {@link SerialPortError} if an error occurrs while closing the connection
     */
    public disconnect = async() => {
        this.wantsToBeConnected = false;
        await this.port.close();
    }

    /**
     * Gets the highs and lows from the console.
     * @returns the highs and lows {@link HighsAndLows}
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getHighsAndLows = async (timeout?: number): Promise<
        [HighsAndLows, VantError | undefined]
    > => {
        const result = new HighsAndLows();
        try {
            await this.checkConsoleConnection(timeout);
        } catch (err: any) {
            return [result, err];
        }

        try {
            let data = await this.writeAndWaitForBuffer("HILOWS\n", 439, timeout);

            // Check acknowledgment byte
            this.validateAcknowledgementByte(data);
            this.registerSuccessfullConsoleCommunication();

            const splitData = this.splitCRCAckDataPackage(data);

            // Check data (crc check)
            this.validateCRC(splitData.data, splitData.crc);

            // Parse data
            return [
                parseHighsAndLows(
                    splitData.data,
                    this.rainClicksToInchTransformer,
                    this.unitTransformers
                ),
                undefined,
            ];
        } catch (err: any) {
            return [result, err];
        }
    };

    /**
     * Gets the default (restructured) LOOP package. The return value is dependent on the weather station's model.
     * This might be either a {@link LOOP1} or a {@link LOOP2} package (or `null` if an error occurrs).
     * @returns the default LOOP package
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getDefaultLOOP = async (timeout?: number): Promise<
        [LOOP1 | LOOP2, undefined] | [null, VantError]
    > => {
        try {
            await this.checkConsoleConnection(timeout);
        } catch (err: any) {
            return [null, err];
        }

        try {
            const data = await this.writeAndWaitForBuffer("LOOP 1\n", 100, timeout);
            // Check ack
            this.validateAcknowledgementByte(data);
            this.registerSuccessfullConsoleCommunication();

            const packageType = data.readUInt8(5);
            if (packageType === 0) {
                const splitData = this.splitCRCAckDataPackage(data);

                // Check data (crc check)
                this.validateCRC(splitData.data, splitData.crc);

                return [
                    parseLOOP1(
                        splitData.data,
                        this.rainClicksToInchTransformer,
                        this.unitTransformers
                    ),
                    undefined,
                ];
            } else {
                const splitData = this.splitCRCAckDataPackage(data);

                // Check data (crc check)
                this.validateCRC(splitData.data, splitData.crc);

                return [
                    parseLOOP2(
                        splitData.data,
                        this.rainClicksToInchTransformer,
                        this.unitTransformers
                    ),
                    undefined,
                ];
            }
        } catch (err: any) {
            return [null, err];
        }
    };

    /**
     * Gets a handful of useful realtime weather data (see {@link BasicRealtimeData}). This includes temperature (in and out), pressure,
     * humidity, wind speed, rain, ...
     * @returns a handful of useful realtime weather data (a simple realtime record)
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getBasicRealtimeData = async (timeout?: number): Promise<
        [BasicRealtimeData, VantError | undefined]
    > => {
        const result = new BasicRealtimeData();
        try {
            await this.checkConsoleConnection(timeout);
        } catch (err: any) {
            return [result, err];
        }

        const [loop, err] = await this.getDefaultLOOP(timeout);

        if (err) {
            return [result, err];
        } else {
            return [flatMerge(result, loop), err];
        }
    };


    /**
     * Creates a basic realtime data container. If there already is a basic realtime container this function returns the existing one
     * and ignores the passed settings.
     * 
     * This basic realtime data container repeatedly calls `.getBasicRealtimeData()` (and `.getHighsAndLows()`) in the background
     * to update it's properties. On every (valid) update the `(valid-)update` is emitted.
     * 
     * You can listen to them using standard event listeners: 
     * ```ts
     * realtime.on("update", (err?) => console.log(`It's ${realtime.tempOut}°F outside!`)) 
     * ```
     * or wait for them asynchroniously:
     * ```ts
     * await realtime.waitForUpdate();
     * console.log(`It's ${realtime.tempOut}°F outside!`);
     * ```
     * 
     * @example
     * ```ts
     * const realtime = WeatherStation.connectBasicRealtimeDataContainer({
     *      updateInterval: 1,
     * });
     * await realtime.waitForUpdate();
     * 
     * console.log(`It's ${realtime.tempOut}°F outside!`);
     * realtime.pause();
     * ```
     * @param settings your desired settings
     * @returns the new or existing realtime data container
     */
    public createBasicRealtimeDataContainer(settings: MinimumRealtimeDataContainerSettings){
        if(this.basicRealtimeContainer === null){
            this.basicRealtimeContainer = new BasicRealtimeDataContainer(settings, this);
        }
        return this.basicRealtimeContainer;
    }

    /**
     * Gets the basic realtime data container that has been created before using `.createBasicRealtimeDataContainer()`.
     * @returns the existing basic realtime data container
     */
    public getBasicRealtimeDataContainer(){
        return this.basicRealtimeContainer;
    }

    /**
     * Returns whether the serial port connection is currently open.
     * @returns whether the serial port connection is currently open
     * @hidden
     */
    protected isPortOpen() {
        return this.port.connectionState === "connected";
    }

    /**
     * Turns the console's background light off / on. Returns whether the command was executed successful.
     * @param state whether the background light should be on
     * @returns whether the command was executed successful
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public setBackgroundLight = async (
        state: boolean,
        timeout?: number
    ): Promise<[boolean, VantError | undefined]> => {
        try {
            await this.checkConsoleConnection(timeout);
        } catch (err: any) {
            return [false, err];
        }

        try {
            const data = await this.writeAndWaitForBuffer(
                `LAMPS ${state ? 1 : 0}\n`,
                6,
                timeout
            );
            const successfull = data.toString("ascii") === "\n\rOK\n\r";
            if(successfull) this.registerSuccessfullConsoleCommunication();

            return [successfull, undefined];
        } catch (err: any) {
            return [false, err];
        }
    };

    /**
     * Gets the backwards compatible weather station type as string.
     * - Wizard III
     * - Wizard II
     * - Monitor
     * - Perception
     * - GroWeather
     * - Energy Enviromontor
     * - Health Enviromonitor
     * - Vantage Pro / Pro 2
     * - Vantage Vue
     * - `null` (an error occurred)
     * @returns the backwards compatible weather station type
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getWeatherstationType = async (timeout?: number): Promise<
        | [
              (
                  | "Wizard III"
                  | "Wizard II"
                  | "Monitor"
                  | "Perception"
                  | "GroWeather"
                  | "Energy Enviromontor"
                  | "Health Enviromonitor"
                  | "Vantage Pro / Pro 2"
                  | "Vantage Vue"
              ),
              undefined
          ]
        | [null, VantError]
    > => {
        const [typeID, err] = await this.getWeatherstationTypeID(timeout);

        switch (typeID) {
            case 0:
                return ["Wizard III", err];
            case 1:
                return ["Wizard II", err];
            case 2:
                return ["Monitor", err];
            case 3:
                return ["Perception", err];
            case 4:
                return ["GroWeather", err];
            case 5:
                return ["Energy Enviromontor", err];
            case 6:
                return ["Health Enviromonitor", err];
            case 16:
                return ["Vantage Pro / Pro 2", err];
            case 17:
                return ["Vantage Vue", err];
            default:
                return [null, err];
        }
    };

    /**
     * Returns whether the interface tries to hold the connection to the weather station. 
     * After calling `connect()` this will return true. After calling `disconnect()` it will return false.
     * @returns whether the interface tries to hold the connection
     */
    public isWantingToBeConnected(): boolean{
        return this.wantsToBeConnected;
    }

    /**
     * Gets the backwards compatible weather station type. Use {@link getWeatherstationType} to get the type as string.
     * - `0` => Wizard III
     * - `1` => Wizard II
     * - `2` => Monitor
     * - `3` => Perception
     * - `4` => GroWeather
     * - `5` => Energy Enviromontor
     * - `6` => Health Enviromonitor
     * - `16` => Vantage Pro / Pro 2
     * - `17` => Vantage Vue
     * - `null` => An error occurred
     * @returns the backwards compatible weather station type
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getWeatherstationTypeID = async (timeout?: number): Promise<
        [0 | 1 | 2 | 3 | 4 | 5 | 6 | 16 | 17, undefined] | [null, VantError]
    > => {
        try {
            await this.checkConsoleConnection(timeout);
        } catch (err: any) {
            return [null, err];
        }

        try{
            const easy = new EasyBuffer(Buffer.alloc(3 + 1 + 1 + 1));
            easy.at(0)
                .write(Type.STRING(3, "ascii"), "WRD")
                .write(Type.UINT8, 0x12)
                .write(Type.UINT8, 0x4d)
                .write(Type.STRING(1, "ascii"), "\n");

            const data = await this.writeAndWaitForBuffer(easy.buffer, 2, timeout);

            this.validateAcknowledgementByte(data);
            this.registerSuccessfullConsoleCommunication();

            const dataWithoutAck = this.removeAcknowledgementByte(data);
            const typeID = dataWithoutAck.readUInt8();

            switch (typeID) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 16:
                case 17:
                    return [typeID, undefined];
                default:
                    return [
                        null,
                        new MalformedDataError(
                            "Received unknown weather station type!"
                        ),
                    ];
            }
        }catch(err: any){
            return [
                null,
                err
            ];
        }
    };
}
