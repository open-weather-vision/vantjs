import { SerialPort } from "serialport";
import { CRC } from "crc-full";
import { TypedEmitter } from "tiny-typed-emitter";
import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";

import HighsAndLowsParser from "../parsers/HighsAndLowsParser";

import MalformedDataError from "../errors/MalformedDataError";
import ClosedConnectionError from "../errors/ClosedConnectionError";
import { SimpleRealtimeData } from "../structures";
import { createRainClicksToInchTransformer } from "../parsers/units/createRainClicksToInchTransformer";
import {
    createUnitTransformers,
    UnitTransformers,
} from "../parsers/units/unitTransformers";
import { defaultUnitSettings } from "../units/defaultUnitSettings";
import { VantInterfaceEvents } from "./events/VantInterfaceEvents";
import { VantInterfaceSettings } from "./settings/VantInterfaceSettings";
import { OnInterfaceCreate } from "./settings/OnInterfaceCreate";
import { MinimumVantInterfaceSettings } from "./settings/MinimumVantInterfaceSettings";
import { FailedToWakeUpError } from "../errors";
import SerialPortError from "../errors/SerialPortError";
import flatMerge from "../util/flatMerge";
import parseLOOP1 from "../parsers/parseLOOP1";
import parseLOOP2 from "../parsers/parseLOOP2";

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
     *  By default, a maximum of 10 listeners can be registered for any single event. This limit can be changed for individual VantInterface instances using the {@link setMaxListeners} method.
     *
     *  To change the default for all EventEmitter instances, this property can be used. If this value is not a positive number, a RangeError is thrown.
     */
    public static defaultMaxListeners: number;

    /**
     * Adds an event listener. Possible events are described {@link VantInterfaceEvents here}.
     * @param eventName The event to listen for
     * @param listener The listener to add
     * @returns this (for chaining calls)
     */
    public addListener<U extends keyof VantInterfaceEvents>(
        eventName: U,
        listener: VantInterfaceEvents[U]
    ): this {
        return super.addListener(eventName, listener);
    }

    /**
     * Removes the specified listener from the listener array for the event named `eventName`.
     * @param eventName the event the listener listens to
     * @param listener the listener to remove
     * @returns this (for chaining calls)
     */
    public removeListener<U extends keyof VantInterfaceEvents>(
        eventName: U,
        listener: VantInterfaceEvents[U]
    ): this {
        return super.removeListener(eventName, listener);
    }

    /**
     * Synchronously calls each of the listeners registered for the event `eventName`, in the order they were registered, passing the supplied arguments to each.
     * Returns `true` if the event had listeners, `false` otherwise.
     * @param eventName
     * @param args
     * @returns whether the event had listeners
     */
    public emit<U extends keyof VantInterfaceEvents>(
        eventName: U,
        ...args: Parameters<VantInterfaceEvents[U]>
    ): boolean {
        return super.emit(eventName, ...args);
    }

    /**
     * Returns an array listing the events for which the VantInterface has registered listeners.
     * @returns an array listing the events for which the VantInterface has registered listeners
     */
    public eventNames<U extends keyof VantInterfaceEvents>(): U[] {
        return super.eventNames();
    }

    /**
     * Returns the current max listener value for the VantInterface which is either set by {@link setMaxListeners} or defaults to {@link defaultMaxListeners}.
     * @returns the current max listener value for the current VantInterface instance
     */
    public getMaxListeners(): number {
        return super.getMaxListeners();
    }

    /**
     * Returns the number of listeners listening to the event named `eventName`.
     * @param eventName
     * @returns the number of listeners listening to the event
     */
    public listenerCount(type: keyof VantInterfaceEvents): number {
        return super.listenerCount(type);
    }

    /**
     * Returns a copy of the array of listeners for the event named `eventName`.
     * @param eventName
     * @returns a copy of the array of listeners for the passed event
     */
    public listeners<U extends keyof VantInterfaceEvents>(
        eventName: U
    ): VantInterfaceEvents[U][] {
        return super.listeners(eventName);
    }

    /**
     * Alias for {@link removeListener}.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public off<U extends keyof VantInterfaceEvents>(
        eventName: U,
        listener: VantInterfaceEvents[U]
    ): this {
        return super.off(eventName, listener);
    }

    /**
     * Alias for {@link addListener}.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public on<U extends keyof VantInterfaceEvents>(
        eventName: U,
        listener: VantInterfaceEvents[U]
    ): this {
        return super.on(eventName, listener);
    }

    /**
     * Adds a one-time listener function for the event named eventName. The next time eventName is triggered, this listener is removed and then invoked.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public once<U extends keyof VantInterfaceEvents>(
        eventName: U,
        listener: VantInterfaceEvents[U]
    ): this {
        return super.once(eventName, listener);
    }

    /**
     * By default, a maximum of 10 listeners can be registered for any single event. This limit can be changed for individual VantInterface instances using this method.
     *
     * To change the default for all EventEmitter instances, change {@link defaultMaxListeners}.
     *
     * @param maxListeners new limit for the amount of listeners for any single event on this VantInterface instance
     * @returns this (for chaining calls)
     */
    public setMaxListeners(maxListeners: number): this {
        return super.setMaxListeners(maxListeners);
    }

    /**
     * Adds the listener function to the beginning of the listeners array for the event named `eventName`.
     * No checks are made to see if the listener has already been added. Multiple calls passing the same combination of `eventName`
     * and listener will result in the listener being added, and called, multiple times.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public prependListener<U extends keyof VantInterfaceEvents>(
        eventName: U,
        listener: VantInterfaceEvents[U]
    ): this {
        return super.prependListener(eventName, listener);
    }

    /**
     * Adds a one-time listener function for the event named `eventName` to the beginning of the listeners array.
     * The next time `eventName` is triggered, this listener is removed, and then invoked.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public prependOnceListener<U extends keyof VantInterfaceEvents>(
        eventName: U,
        listener: VantInterfaceEvents[U]
    ): this {
        return super.prependOnceListener(eventName, listener);
    }

    /**
     * Removes all listeners, or those of the specified `eventName`.
     * @param eventName
     * @returns this (for chaining calls)
     */
    public removeAllListeners(eventName?: keyof VantInterfaceEvents): this {
        return super.removeAllListeners(eventName);
    }

    /**
     * The serial port connection used internally.
     * @hidden
     */
    private readonly port: SerialPort;

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

    /**
     * The VantInterface's default settings.
     */
    private static defaultSettings = {
        baudRate: 19200,
        onCreate: OnInterfaceCreate.OpenAndWakeUp,
        units: defaultUnitSettings,
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
     * const device = await VantInterface.create({ path: "COM3", rainCollectorSize: "0.2mm" });
     *
     * const highsAndLows = await device.getHighsAndLows();
     * inspect(highsAndLows);
     *
     * await device.close();
     * ```
     * @param settings the interface settings
     *
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @throws {@link FailedToWakeUpError} if the console doesn't wake up after trying three times
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     */
    public static async create(settings: MinimumVantInterfaceSettings) {
        const device = new VantInterface(settings);

        await this.performOnCreateAction(device);

        return device;
    }

    /**
     * Performs the configured {@link OnCreate} action.
     * @param device the device on which the action is to be performed
     *
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @throws {@link FailedToWakeUpError} if the console doesn't wake up after trying three times
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @hidden
     */
    protected static async performOnCreateAction(device: VantInterface) {
        switch (device.settings.onCreate) {
            case OnInterfaceCreate.DoNothing:
                break;
            case OnInterfaceCreate.Open:
                await device.open();
                break;
            case OnInterfaceCreate.OpenAndWakeUp:
                await device.open();
                await device.wakeUp();
                break;
        }
    }

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
        );

        this.rainClicksToInchTransformer = createRainClicksToInchTransformer(
            this.settings.rainCollectorSize
        );

        this.unitTransformers = createUnitTransformers(this.settings.units);

        this.port = new SerialPort({
            path: this.settings.path,
            baudRate: this.settings.baudRate,
            autoOpen: false,
        });

        this.port.on("close", () => {
            this.emit("close");
        });

        this.port.on("open", () => {
            this.emit("open");
        });
    }

    /**
     * Writes the passed data to the output stream ({@link port}) and waits for the passed event
     * to occurr.
     * @param chunk the data to write to the output stream
     * @param event the event to wait for
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @hidden
     */
    protected writeAndWaitForEvent = (chunk: any, event: string) => {
        return new Promise<void>((resolve, reject) => {
            const listener = (err: Error) => {
                reject(new SerialPortError(err));
            };
            this.port.once("error", listener);
            this.port.write(chunk, (err) => {
                if (err) {
                    this.port.removeListener("error", listener);
                    reject(new SerialPortError(err));
                } else {
                    this.port.once(event, () => {
                        this.port.removeListener("error", listener);
                        resolve();
                    });
                }
            });
        });
    };

    /**
     * Writes the passed data to the output stream ({@link port}) and waits for an incoming buffer.
     * @param chunk the data to write to the output stream
     * @returns the incoming buffer
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @hidden
     */
    protected writeAndWaitForBuffer = (chunk: any) => {
        return new Promise<Buffer>((resolve, reject) => {
            const listener = (err: Error) => {
                reject(new SerialPortError(err));
            };
            this.port.once("error", listener);
            this.port.write(chunk, (err) => {
                if (err) {
                    this.port.removeListener("error", listener);
                    reject(new SerialPortError(err));
                } else {
                    this.port.once("data", (data: Buffer) => {
                        this.port.removeListener("error", listener);
                        resolve(data);
                    });
                }
            });
        });
    };

    /**
     * Waits for an incoming buffer.
     * @returns the incoming buffer
     * @hidden
     */
    protected waitForBuffer = () => {
        return new Promise<Buffer>((resolve) => {
            this.port.once("data", (data: Buffer) => {
                resolve(data);
            });
        });
    };

    /**
     * Splits a buffer received from the console into the acknowledgement byte, the weather data itself and the two crc bytes.
     * @param buffer
     * @returns the buffer split in thee pieces (acknowledgement byte, the weather data itself, the two crc bytes)
     * @throws {@link MalformedDataError} if the passed buffer is malformed
     * @hidden
     */
    protected splitCRCAckDataPackage = (buffer: Buffer) => {
        try {
            const bufferCopy = Buffer.alloc(buffer.length - 3);
            buffer.copy(bufferCopy, 0, 1, buffer.length - 2);
            return {
                ack: buffer.readUInt8(0),
                weatherData: bufferCopy,
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
     * Validates the acknowledgement byte (first byte) of an buffer received from the vantage console.
     * @param buffer
     * @throws {@link MalformedDataError} if the acknowledgement byte is invalid or the received buffer is malformed
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
     * @throws {@link MalformedDataError} if the CRC value is invalid
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
     * @throws {@link ClosedConnectionError} if the connection is already closed or closing
     */
    protected checkPortConnection = () => {
        if (!this.port.isOpen || this.port.closing)
            throw new ClosedConnectionError();
    };

    /**
     * Opens the serial connection to the vantage console. Remember that
     * the console also needs to be woken up via {@link wakeUp}. This is necessary in order to send and receive data.
     *
     * Don't forget to close the connection to the console.
     *
     * Calling this method even though the connection is already open won't cause any problems.
     *
     * @throws {@link SerialPortError} if an error occurs while opening the serialport connection
     */
    public open = async () => {
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
     * Fires the {@link VantInterfaceEvents.awakening} event if the console wakes up.
     *
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @throws {@link FailedToWakeUpError} if the console doesn't wake up after trying three times
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public wakeUp = async () => {
        this.checkPortConnection();
        let succeeded = false;
        let tries = 0;
        do {
            await this.writeAndWaitForEvent("\n", "readable");
            const response = String.raw`${this.port.read()}`;
            if (response === "\n\r") {
                this.emit("awakening");
                succeeded = true;
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
     *
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public validateConnection = async () => {
        this.checkPortConnection();
        const data = await this.writeAndWaitForBuffer("TEST\n");
        return data.toString("utf-8", 2, 6) === "TEST";
    };

    /**
     * Gets the console's firmware date code in the `"Month dd yyyy"` format (e.g. `"Sep 12 2017"`).
     * @returns the console's firmware date code
     *
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @throws {@link MalformedDataError} if the data received from the console is malformed
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getFirmwareDateCode = async () => {
        this.checkPortConnection();
        const data = await this.writeAndWaitForBuffer("VER\n");
        try {
            return data.toString("utf-8").split("OK")[1].trim();
        } catch (err) {
            throw new MalformedDataError("Received malformed data");
        }
    };

    /**
     * Closes the connection to the weather station (if it's open). Throws no error if the connection is already closed.
     *
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public close = () => {
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
     * @returns the highs and lows
     *
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @throws {@link MalformedDataError} if the data received from the console is malformed
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @throws {@link ParserError} if vantjs failed to parse the data received from the console, this shouldn't happen
     */
    public getHighsAndLows = async () => {
        this.checkPortConnection();
        const data = await this.writeAndWaitForBuffer("HILOWS\n");

        // Check acknowledgment byte
        this.validateAcknowledgementByte(data);

        const splittedData = this.splitCRCAckDataPackage(data);

        // Check data (crc check)
        this.validateCRC(splittedData.weatherData, splittedData.crc);

        // Parse data
        const parsedWeatherData = new HighsAndLowsParser(
            this.rainClicksToInchTransformer,
            this.unitTransformers
        ).parse(splittedData.weatherData);

        return parsedWeatherData;
    };

    /**
     * Gets the default (restructured) LOOP package. The return value is dependent on the weather station's model.
     * This might be either a {@link LOOP1} or a {@link LOOP2} package.
     * @returns the default LOOP package
     *
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @throws {@link MalformedDataError} if the data received from the console is malformed
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @throws {@link ParserError} if vantjs failed to parse the data received from the console, this shouldn't happen
     */
    public getDefaultLOOP = async () => {
        this.checkPortConnection();
        const data = await this.writeAndWaitForBuffer("LOOP 1\n");
        // Check ack
        this.validateAcknowledgementByte(data);

        const packageType = data.readUInt8(5);
        if (packageType === 0) {
            const splittedData = this.splitCRCAckDataPackage(data);

            // Check data (crc check)
            this.validateCRC(splittedData.weatherData, splittedData.crc);

            return parseLOOP1(
                splittedData.weatherData,
                this.rainClicksToInchTransformer,
                this.unitTransformers
            );
        } else {
            // LOOP 2 data is splitted (only tested on vantage pro 2)
            const firstPartOfLOOP2 = data;

            const secondPartOfLOOP2 = await this.waitForBuffer();
            const dataFull = Buffer.concat([
                firstPartOfLOOP2,
                secondPartOfLOOP2,
            ]);
            const splittedData = this.splitCRCAckDataPackage(dataFull);

            // Check data (crc check)
            this.validateCRC(splittedData.weatherData, splittedData.crc);

            return parseLOOP2(
                splittedData.weatherData,
                this.rainClicksToInchTransformer,
                this.unitTransformers
            );
        }
    };

    /**
     * Gets a handful of useful realtime weather data (see {@link SimpleRealtimeData}). This includes temperature (in and out), pressure,
     * humidity, wind speed, rain, ...
     * @returns a handful of useful realtime weather data (a simple realtime record)
     *
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @throws {@link MalformedDataError} if the data received from the console is malformed
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @throws {@link ParserError} if vantjs failed to parse the data received from the console, this shouldn't happen
     */
    public getSimpleRealtimeData = async (): Promise<SimpleRealtimeData> => {
        this.checkPortConnection();

        return flatMerge(new SimpleRealtimeData(), await this.getDefaultLOOP());
    };

    /**
     * Returns whether the serial port connection is currently open.
     * @returns whether the serial port connection is currently open
     */
    public isPortOpen() {
        return this.port.isOpen;
    }
}
