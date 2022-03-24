import { SerialPort } from "serialport";
import { CRC } from "crc-full";
import { TypedEmitter } from "tiny-typed-emitter";
import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";

import HighsAndLowsParser from "../parsers/HighsAndLowsParser";
import LOOPParser from "../parsers/LOOPParser";
import LOOP2Parser from "../parsers/LOOP2Parser";

import SerialConnectionError from "../errors/SerialConnectionError";
import MalformedDataError from "../errors/MalformedDataError";
import ClosedConnectionError from "../errors/ClosedConnectionError";
import { SimpleRealtimeRecord } from "../structures/SimpleRealtimeRecord";
import {
    createRainClicksToInchTransformer,
    RainCollectorSize,
} from "../parsers/units/RainCollector";
import {
    createUnitTransformers,
    UnitTransformers,
} from "../parsers/units/unitTransformers";
import { defaultUnitSettings } from "../parsers/units/defaultUnitSettings";

interface VantInterfaceEvents {
    /** Fires when the connection to the vantage console closes. */
    close: () => void;
    /** Fires when the vantage console awakes successfully. */
    awakening: () => void;
    /** Fires when the connection to the vantage console opens. */
    open: () => void;
}

/**
 * Different actions to perform automatically on creating an interface.
 *
 * @see VantInterface.create
 * @see VantPro2Interface.create
 * @see VantProInterface.create
 * @see VantVueInterface.create
 */
export enum OnCreate {
    /**
     * Does nothing.
     */
    DoNothing = 1,
    /**
     * Opens the serial connection to the vantage console. Remember that
     * the console also needs to be woken up. Consider using {@link OpenAndWakeUp} instead.
     */
    Open = 2,
    /**
     * Open the serial connection to the vantage console and wakes it up.
     */
    OpenAndWakeUp = 3,
}

export type UnitSettings = {
    readonly wind: "km/h" | "mph" | "ft/s" | "knots" | "Bft" | "m/s";
    readonly temperature: "°C" | "°F";
    readonly pressure: "hPa" | "inHg" | "mmHg" | "mb";
    readonly solarRadiation: "W/m²";
    readonly rain: "in" | "mm";
};

/**
 * Settings for the {@link VantInterface}.
 */
export interface VantInterfaceSettings {
    /**
     * The used (serial) path to communicate with your weather station. On windows devices paths usually start with `COM` followed by the port number, on linux/osx
     * common paths start with `"/dev/tty"` followed by the port number.
     */
    readonly path: string;

    /**
     * The used baud rate. Adjustable in the vantage console. Default is `19200` other
     * options are `1200`, `2400`, `4800`, `9600` and `14400`.
     */
    readonly baudRate: number;

    /**
     * The action to perform automatically on creating an interface.
     *
     * @see OnCreate
     */
    readonly onCreate: OnCreate;

    /**
     * The weather station's collector size.
     */
    readonly rainCollectorSize: RainCollectorSize;

    /**
     * Configures the units to use. Doesn't have to match the units displayed on your console.
     */
    readonly units: UnitSettings;
}

/**
 * The minimum required settings for any vant interface.
 */
export interface MinimumVantInterfaceSettings {
    /**
     * The used (serial) path to communicate with your weather station. On windows devices paths usually start with `COM` followed by the port number, on linux/osx
     * common paths start with `"/dev/tty"` followed by the port number.
     */
    readonly path: string;

    /**
     * The used baud rate. Adjustable in the vantage console. Default is `19200` other
     * options are `1200`, `2400`, `4800`, `9600` and `14400`.
     */
    readonly baudRate?: number;

    /**
     * The action to perform automatically on creating an interface.
     *
     * @see OnCreate
     */
    readonly onCreate?: OnCreate;

    /**
     * The weather station's collector size.
     */
    readonly rainCollectorSize: RainCollectorSize;

    /**
     * Configures the units to use. Doesn't have to match the units displayed on your console.
     */
    readonly units?: Partial<UnitSettings>;
}

/**
 * Interface to _any vantage weather station_ (Vue, Pro, Pro 2). The device must be connected serially.
 * To interact with the weather station create an instance of this class using {@link VantInterface.create}.
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

    /**
     * The crc type used internally to validate transmitted packages.
     * @hidden
     */
    protected readonly crc16 = CRC.default("CRC16_CCIT_ZERO") as CRC;

    protected readonly rainClicksToInchTransformer: (
        rainClicks: number
    ) => number;

    protected readonly unitTransformers: UnitTransformers;

    /**
     * The VantInterface's default settings.
     */
    private static defaultSettings = {
        baudRate: 19200,
        onCreate: OnCreate.OpenAndWakeUp,
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
     * Creates an interface to your vantage console (Vue, Pro, Pro 2) using the passed settings. The device should be connected
     * serially. The passed path specifies the path to communicate with the console. On Windows paths
     * like `COM1`, `COM2`, ... are common, on osx/linux devices common paths are `/dev/tty0`, `/dev/tty2`, ...
     *
     * Weather station dependent functionality (e.g. firmware version code for Vantage Pro 2 / Vue) is not supported on this interface.
     * Use {@link VantPro2Interface}, {@link VantProInterface} and {@link VantVueInterface} for station dependent features.
     *
     * @example
     * const device = await VantInterface.create({ path: "COM3" });
     *
     * const highsAndLows = await device.getHighsAndLows();
     * inspect(highsAndLows);
     *
     * await device.close();
     * @param settings the interface settings
     */
    public static async create(settings: MinimumVantInterfaceSettings) {
        const device = new VantInterface(settings);

        await this.performOnCreateAction(device);

        return device;
    }

    /**
     * Performs the configured {@link OnCreate} action.
     * @param device the device on which the action is to be performed
     * @hidden
     */
    protected static async performOnCreateAction(device: VantInterface) {
        switch (device.settings.onCreate) {
            case OnCreate.DoNothing:
                break;
            case OnCreate.Open:
                await device.open();
                break;
            case OnCreate.OpenAndWakeUp:
                await device.open();
                await device.wakeUp();
                break;
        }
    }

    /**
     * Creates a new interface. Merges the passed settings with the default ones, prepares the internally used serial port connection and
     * configures the `"close"` and `"open"` event. Doesn't perform the configured {@link OnCreate} action.
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
     * @hidden
     */
    protected writeAndWaitForEvent = (chunk: any, event: string) => {
        return new Promise<void>((resolve, reject) => {
            this.port.write(chunk, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.port.once(event, () => {
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
     * @hidden
     */
    protected writeAndWaitForBuffer = (chunk: any) => {
        return new Promise<Buffer>((resolve, reject) => {
            this.port.write(chunk, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.port.once("data", (data: Buffer) => {
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
     * @hidden
     */
    protected splitCRCAckDataPackage = (buffer: Buffer) => {
        const bufferCopy = Buffer.alloc(buffer.length - 3);
        buffer.copy(bufferCopy, 0, 1, buffer.length - 2);
        return {
            ack: buffer.readUInt8(0),
            weatherData: bufferCopy,
            crc: buffer.readUInt16BE(buffer.length - 2),
        };
    };

    /**
     * Validates the acknowledgement byte (first byte) of an buffer received from the vantage console.
     * @param buffer
     * @throws {MalformedDataError} if the acknowledgement byte is invalid
     * @hidden
     */
    protected validateAcknowledgementByte = (buffer: Buffer) => {
        const ack = buffer.readUInt8(0);
        if (ack == 0x06 || ack == 0x15) return;
        // 0x18 (not-ack) 0x21
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
     * @throws {MalformedDataError} if the CRC value is invalid
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
     * @throws {ClosedConnectionError} if the connection is already closed or closing
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
                        reject(err);
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
     * @throws {SerialConnectionError} if the console doesn't wake up
     */
    public wakeUp = async () => {
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
            throw new SerialConnectionError("Failed to wake up console!");
        }
    };

    /**
     * Validates the connection to the console by running the TEST command. No error is thrown on failure, instead `false` is resolved.
     * @returns whether the connection is valid
     */
    public validateConnection = async () => {
        this.checkPortConnection();
        const data = await this.writeAndWaitForBuffer("TEST\n");
        return data.toString("utf-8", 2, 6) === "TEST";
    };

    /**
     * Gets the console's firmware date code.
     * @returns the console's firmware date code
     * @throws {MalformedDataError} if the received data is malformed
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
     * @throws an error when something unexpectedly goes wrong
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
                        reject(err);
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

            return new LOOPParser(
                this.rainClicksToInchTransformer,
                this.unitTransformers
            ).parse(splittedData.weatherData);
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

            return new LOOP2Parser(
                this.rainClicksToInchTransformer,
                this.unitTransformers
            ).parse(splittedData.weatherData);
        }
    };

    /**
     * Gets a handful of useful realtime weather data (a {@link SimpleRealtimeRecord}). This includes temperature (in and out), pressure,
     * humidy, wind, rain, ...
     * @returns a handful of useful realtime weather data (a simple realtime record)
     */
    public getSimpleRealtimeRecord =
        async (): Promise<SimpleRealtimeRecord> => {
            this.checkPortConnection();

            const loopPackage = await this.getDefaultLOOP();

            let windAvg: number | null;
            if (loopPackage.wind.avg instanceof Object) {
                windAvg = loopPackage.wind.avg.twoMinutes;
            } else {
                windAvg = loopPackage.wind.avg;
            }

            return {
                pressure: {
                    current: loopPackage.pressure.current,
                    trend: {
                        value: loopPackage.pressure.trend.value,
                        text: loopPackage.pressure.trend.text,
                    },
                },
                temperature: {
                    in: loopPackage.temperature.in,
                    out: loopPackage.temperature.out,
                },
                humidity: {
                    in: loopPackage.humidity.in,
                    out: loopPackage.humidity.out,
                },
                wind: {
                    current: loopPackage.wind.current,
                    avg: windAvg,
                    direction: {
                        degrees: loopPackage.wind.direction,
                        abbrevation:
                            this.convertWindDirectionDegreesToAbbrevation(
                                loopPackage.wind.direction
                            ),
                    },
                },
                rain: {
                    rate: loopPackage.rain.rate,
                    storm: loopPackage.rain.storm,
                    stormStartDate: loopPackage.rain.stormStartDate,
                    day: loopPackage.rain.day,
                },
                et: loopPackage.et.day,
                uv: loopPackage.uv,
                solarRadiation: loopPackage.solarRadiation,
                time: new Date(),
            };
        };

    private convertWindDirectionDegreesToAbbrevation(
        windDirection: number | null
    ):
        | "NNE"
        | "NE"
        | "ENE"
        | "E"
        | "ESE"
        | "SE"
        | "SSE"
        | "S"
        | "SSW"
        | "SW"
        | "WSW"
        | "W"
        | "WNW"
        | "NW"
        | "NNW"
        | "N"
        | null {
        if (windDirection === null) return null;
        const steps = [
            22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270,
            292.5, 315, 337.5, 360,
        ];
        const stepsAbbrevations: [
            "NNE",
            "NE",
            "ENE",
            "E",
            "ESE",
            "SE",
            "SSE",
            "S",
            "SSW",
            "SW",
            "WSW",
            "W",
            "WNW",
            "NW",
            "NNW",
            "N"
        ] = [
            "NNE",
            "NE",
            "ENE",
            "E",
            "ESE",
            "SE",
            "SSE",
            "S",
            "SSW",
            "SW",
            "WSW",
            "W",
            "WNW",
            "NW",
            "NNW",
            "N",
        ];
        const differences = [];

        for (const step of steps) {
            let difference = Math.abs(step - windDirection);
            if (difference > 180) {
                difference = 360 - difference;
            }
            differences.push(difference);
        }

        let smallestDifference = 361;
        let smallestDifferenceIndex = -1;
        for (let i = 0; i < differences.length; i++) {
            if (differences[i] < smallestDifference) {
                smallestDifference = differences[i];
                smallestDifferenceIndex = i;
            }
        }

        if (smallestDifferenceIndex === -1) {
            return null;
        } else {
            return stepsAbbrevations[smallestDifferenceIndex];
        }
    }

    /**
     * Returns whether the serial port connection is currently open.
     * @returns whether the serial port connection is currently open
     */
    public isPortOpen = () => {
        return this.port.isOpen;
    };
}
