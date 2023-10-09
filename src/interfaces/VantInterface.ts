import { SerialPort } from "serialport";
import { CRC } from "crc-full";
import { TypedEmitter } from "tiny-typed-emitter";
import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";

import {
    SimpleRealtimeData,
    HighsAndLows,
    LOOP1,
    LOOP2,
} from "vant-environment/structures";
import { defaultUnitSettings } from "vant-environment/units";
import { VantInterfaceEvents } from "./events";
import {
    VantInterfaceSettings,
    MinimumVantInterfaceSettings,
} from "./settings";
import {
    FailedToWakeUpError,
    SerialPortError,
    MalformedDataError,
    ClosedConnectionError,
    VantError,
} from "../errors";
import flatMerge from "../util/flatMerge";
import {
    parseHighsAndLows,
    parseLOOP1,
    parseLOOP2,
    createRainClicksToInchTransformer,
    createUnitTransformers,
    UnitTransformers,
} from "../parsers";
import { EasyBuffer, Type } from "@harrydehix/easy-buffer";
import TimeoutError from "../errors/TimeoutError";

/**
 * Interface to _any vantage weather station_ (Vue, Pro, Pro 2). Provides useful methods to access realtime weather data from your weather station's
 * console. The device must be connected serially.
 * To interact with your weather station create an instance of this class using {@link VantInterface.create}.
 *
 * The VantInterface is an [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter). The events fired by the interface are described {@link VantInterfaceEvents here}.
 *
 * This interface is limited to station independent features.
 * Use {@link VantPro2Interface}, {@link VantProInterface} and {@link VantVueInterface} for station dependent features.
 */
export default class VantInterface extends TypedEmitter<VantInterfaceEvents> {
    /**
     * The serial port connection used internally.
     * @hidden
     */
    private readonly port: SerialPort;

    private connected: boolean = false;
    private awake: boolean = false;

    /**
     * The crc type used internally to validate transmitted packages.
     * @hidden
     */
    protected readonly crc16 = CRC.default("CRC16_CCIT_ZERO") as CRC;

    /**
     * @hidden
     */
    protected readonly rainClicksToInchTransformer: (
        rainClicks: number
    ) => number;

    protected readonly unitTransformers: UnitTransformers;

    private activityRegistered = false;

    private wakeUpInterval?: NodeJS.Timeout;
    private reconnectInterval?: NodeJS.Timeout;

    /**
     * The VantInterface's default settings.
     */
    private static defaultSettings: Partial<VantInterfaceSettings> = {
        baudRate: 19200,
        units: defaultUnitSettings,
        reconnectionInterval: 1000,
    };

    /**
     * The used interface settings. These control the addressed serialport, the baud rate, the
     * used units, etc. They are immutable.
     *
     * @see VantInterfaceSettings
     */
    public readonly settings: VantInterfaceSettings;

    /**
     * Creates an interface to your vantage console (Vue, Pro, Pro 2) using the passed settings (see {@link MinimumVantInterfaceSettings}). The device should be connected
     * serially.
     *
     * Weather station dependent functionality (e.g. firmware version code for Vantage Pro 2 / Vue) is not supported on this interface.
     * Use {@link VantPro2Interface}, {@link VantProInterface} and {@link VantVueInterface} for station dependent features.
     *
     * @example
     * ```typescript
     * const device = await VantInterface.connect({ path: "COM3", rainCollectorSize: "0.2mm" });
     *
     * const [highsAndLows, err] = await device.getHighsAndLows();
     * inspect(highsAndLows);
     *
     * await device.disconnect();
     * ```
     * @param settings the interface settings
     *
     * @throws a {@link SerialPortError} if the serialport connection unexpectedly closes (the specified serial path might be invalid)
     * @throws a {@link FailedToWakeUpError} if the console didn't wake up
     * @throws a {@link ClosedConnectionError} if the connection gets closed while connecting
     */
    public static async connect(settings: MinimumVantInterfaceSettings) {
        const device = new VantInterface(settings);

        await device.openSerialPort();
        await device.wakeUp(true);

        return device;
    }

    /**
     * @throws a {@link SerialPortError} if the serialport connection unexpectedly closes (the specified serial path might be invalid)
     * @throws a {@link FailedToWakeUpError} if the console didn't wake up
     * @throws a {@link ClosedConnectionError} if the connection gets closed while connecting
     */
    public reconnect = async () => {
        await this.openSerialPort();
        await this.wakeUp(true);
        this.setupWakeUpInterval();
    };

    protected tryToReconnect = async () => {
        this.reconnectInterval = setTimeout(async () => {
            try {
                await this.openSerialPort();
                await this.wakeUp(true);
            } catch (err: any) {
                this.tryToReconnect();
            }
        }, this.settings.reconnectionInterval);
    };

    /**
     * Creates a new interface. Merges the passed settings with the default ones, prepares the internally used serial port connection and
     * configures the `"close"` and `"open"` event. Doesn't perform the configured {@link OnInterfaceCreate} action.
     * @param settings the interface settings to use
     * @hidden
     */
    protected constructor(settings: MinimumVantInterfaceSettings) {
        super();

        this.settings = merge(
            cloneDeep(VantInterface.defaultSettings),
            settings
        ) as VantInterfaceSettings;

        this.rainClicksToInchTransformer = createRainClicksToInchTransformer(
            this.settings.rainCollectorSize
        );

        this.unitTransformers = createUnitTransformers(this.settings.units);

        this.port = new SerialPort({
            path: this.settings.path,
            baudRate: this.settings.baudRate,
            autoOpen: false,
        });

        this.setupWakeUpInterval();

        this.port.on("close", () => {
            this.emit("disconnect");
        });
    }

    private setupWakeUpInterval() {
        this.wakeUpInterval = setInterval(() => {
            if (!this.activityRegistered) {
                try {
                    this.wakeUp(false);
                } catch (err) {}
            }
            this.activityRegistered = false;
        }, 1000 * 90);
    }

    /**
     * Write the passed data to the serialport and waits for a buffer with the passed byte size. If the data is received in split packages, the data gets concatenated.
     * @param chunk the data to write to the serialport
     * @param expectedBufferSize the expected byte size of the buffer
     * @returns the buffer having the expected size
     * @throws a {@link TimeoutError} (timeout exceeded)
     * @throws a {@link SerialPortError} (error while writing)
     */
    protected writeAndWaitForBuffer = (
        chunk: any,
        expectedBufferSize: number,
        timeout?: number
    ) => {
        return new Promise<Buffer>((resolve, reject) => {
            let timeoutTimer: NodeJS.Timeout | undefined;
            if (timeout) {
                timeoutTimer = setTimeout(() => {
                    reject(new TimeoutError(timeout));
                }, timeout);
            }

            let dataListener: (data: Buffer) => void;

            const errorListener = (err: Error) => {
                this.port.removeListener("data", dataListener);
                reject(new SerialPortError(err));
            };

            this.port.once("error", errorListener);

            this.port.write(chunk, (err) => {
                if (err) {
                    this.port.removeListener("error", errorListener);
                    reject(new SerialPortError(err));
                } else {
                    let buffer: Buffer = Buffer.alloc(0);

                    dataListener = (data: Buffer) => {
                        buffer = Buffer.concat([buffer, data]);

                        if (buffer.byteLength >= expectedBufferSize) {
                            this.port.removeListener("error", errorListener);
                            this.port.removeListener("data", dataListener);
                            if (timeoutTimer) clearTimeout(timeoutTimer);
                            resolve(buffer);
                        }
                    };

                    this.port.on("data", dataListener);
                }
            });
        });
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

    /**
     * Checks the serial port connection.
     * @throws a {@link ClosedConnectionError} if the connection is already closed or closing
     */
    protected checkPortConnection = () => {
        if (!this.port.isOpen || this.port.closing) {
            if (this.connected) {
                this.tryToReconnect();
            }
            throw new ClosedConnectionError();
        }
    };

    protected registerActivity = () => {
        this.activityRegistered = true;
    };

    /**
     * Opens the serial connection to the vantage console. Remember that
     * the console also needs to be woken up via {@link wakeUp}. This is necessary in order to send and receive data.
     *
     * Don't forget to close the connection to the console.
     *
     * Calling this method even though the connection is already open won't cause any problems.
     *
     * @throws a {@link SerialPortError} if an error occurs while opening the serialport connection
     */
    protected openSerialPort = async () => {
        return new Promise<void>((resolve, reject) => {
            if (this.port.isOpen) {
                resolve();
            } else if (this.port.opening) {
                this.port.once("open", () => {
                    resolve();
                });
            } else {
                this.port.open((err) => {
                    if (err) {
                        reject(new SerialPortError(err));
                    } else {
                        resolve();
                    }
                });
            }
        });
    };

    /**
     * Wakes up the vantage console. This is necessary in order to send and receive data. The console automatically
     * falls asleep after two minutes of inactivity and needs to be woken up again.
     *
     * Fires the {@link VantInterfaceEvents.connect} event if the console wakes up.
     *
     * @throws a {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @throws a {@link FailedToWakeUpError} if the console doesn't wake up after trying three times
     * @throws a {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    protected wakeUp = async (emitConnectionEvent: boolean) => {
        this.checkPortConnection();
        this.registerActivity();
        let succeeded = false;
        let tries = 0;
        do {
            const data = await this.writeAndWaitForBuffer("\n", 2);
            if (data.toString("ascii") === "\n\r") {
                succeeded = true;
                this.awake = true;
                this.connected = true;
                if (emitConnectionEvent) {
                    this.emit("connect");
                }
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
     * Validates the connection to the console by running the TEST command. No error is thrown on failure, instead `false` is resolved.
     * @returns whether the connection is valid
     */
    public checkConnection = async (): Promise<boolean> => {
        try {
            this.checkPortConnection();
            this.registerActivity();
            const data = await this.writeAndWaitForBuffer("TEST\n", 8);
            return data.toString("ascii").includes("TEST");
        } catch (err: any) {
            return false;
        }
    };

    public waitUntilConnected = (): Promise<void> => {
        return new Promise<void>((reject, resolve) => {
            if (this.port.isOpen && this.awake) {
                resolve();
            } else {
                this.once("connect", () => {
                    resolve();
                });
            }
        });
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
    public getFirmwareDateCode = async (): Promise<
        [string, undefined] | [null, VantError]
    > => {
        this.checkPortConnection();
        this.registerActivity();
        const data = await this.writeAndWaitForBuffer("VER\n", 19);
        try {
            return [data.toString("ascii").split("OK")[1].trim(), undefined];
        } catch (err) {
            return [null, new MalformedDataError("Received malformed data")];
        }
    };

    /**
     * Closes the connection to the weather station (if it's open). Throws no error if the connection is already closed.
     *
     * @throws a {@link SerialPortError} if an error occurrs while closing the connection
     */
    public disconnect = () => {
        if (this.wakeUpInterval) {
            clearInterval(this.wakeUpInterval);
        }
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }

        this.connected = false;

        return new Promise<void>((resolve, reject) => {
            if (this.port.closing) {
                this.port.once("close", () => {
                    resolve();
                });
            } else if (this.port.isOpen) {
                this.port.close((err) => {
                    if (err) {
                        reject(new SerialPortError(err));
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    };

    /**
     * Gets the highs and lows from the console.
     * @returns the highs and lows {@link HighsAndLows}
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getHighsAndLows = async (): Promise<
        [HighsAndLows, VantError | undefined]
    > => {
        const result = new HighsAndLows();
        try {
            this.checkPortConnection();
        } catch (err: any) {
            return [result, err];
        }
        this.registerActivity();

        try {
            let data = await this.writeAndWaitForBuffer("HILOWS\n", 439);

            // Check acknowledgment byte
            this.validateAcknowledgementByte(data);

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
    public getDefaultLOOP = async (): Promise<
        [LOOP1 | LOOP2, undefined] | [null, VantError]
    > => {
        try {
            this.checkPortConnection();
        } catch (err: any) {
            return [null, err];
        }
        this.registerActivity();

        try {
            const data = await this.writeAndWaitForBuffer("LOOP 1\n", 100);
            // Check ack
            this.validateAcknowledgementByte(data);

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
     * Gets a handful of useful realtime weather data (see {@link SimpleRealtimeData}). This includes temperature (in and out), pressure,
     * humidity, wind speed, rain, ...
     * @returns a handful of useful realtime weather data (a simple realtime record)
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getSimpleRealtimeData = async (): Promise<
        [SimpleRealtimeData, VantError | undefined]
    > => {
        const result = new SimpleRealtimeData();
        try {
            this.checkPortConnection();
        } catch (err: any) {
            return [result, err];
        }

        const [loop, err] = await this.getDefaultLOOP();

        if (err) {
            return [result, err];
        } else {
            return [flatMerge(result, loop), err];
        }
    };

    /**
     * Returns whether the serial port connection is currently open.
     * @returns whether the serial port connection is currently open
     */
    public isPortOpen() {
        return this.port.isOpen;
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
        state: boolean
    ): Promise<[boolean, VantError | undefined]> => {
        try {
            this.checkPortConnection();
        } catch (err: any) {
            return [false, err];
        }
        this.registerActivity();

        try {
            const data = await this.writeAndWaitForBuffer(
                `LAMPS ${state ? 1 : 0}\n`,
                6
            );

            return [data.toString("ascii") === "\n\rOK\n\r", undefined];
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
    public getWeatherstationType = async (): Promise<
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
        const [typeID, err] = await this.getWeatherstationTypeID();

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
    public getWeatherstationTypeID = async (): Promise<
        [0 | 1 | 2 | 3 | 4 | 5 | 6 | 16 | 17, undefined] | [null, VantError]
    > => {
        try {
            this.checkPortConnection();
        } catch (err: any) {
            return [null, err];
        }
        this.registerActivity();

        const easy = new EasyBuffer(Buffer.alloc(3 + 1 + 1 + 1));
        easy.at(0)
            .write(Type.STRING(3, "ascii"), "WRD")
            .write(Type.UINT8, 0x12)
            .write(Type.UINT8, 0x4d)
            .write(Type.STRING(1, "ascii"), "\n");

        const data = await this.writeAndWaitForBuffer(easy.buffer, 2);

        this.validateAcknowledgementByte(data);

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
    };
}
