import { SerialPort } from "serialport";
import { CRC } from "crc-full";
import HighsAndLowsParser from "../parsers/HighsAndLowsParser";
import LOOPParser from "../parsers/LOOPParser";
import LOOP2Parser from "../parsers/LOOP2Parser";

import SerialConnectionError from "../errors/SerialConnectionError";
import MalformedDataError from "../errors/MalformedDataError";
import ClosedConnectionError from "../errors/ClosedConnectionError";
import merge from "lodash.merge";
import MissingDevicePathError from "../errors/MissingDevicePathError";

import { TypedEmitter } from "tiny-typed-emitter";

interface VantInterfaceEvents {
    close: () => void;
    awakening: () => void;
    open: () => void;
}

export interface VantInterfaceSettings {
    path: string | null;
    baudRate: number;
}

/**
 * Interface to _any vantage weather station_ (Vue, Pro, Pro 2). The device must be connected serially.
 * To interact with the weather station create an instance of this class and use the {@link ready} function.
 *
 * To handle errors listen to error events using `device.on("error", (err: Error) => { ... });`
 *
 * This interface is limited to station independent features.
 * Use {@link VantPro2Interface}, {@link VantProInterface} and {@link VantVueInterface} for station dependent features.
 */
export default class VantInterface extends TypedEmitter<VantInterfaceEvents> {
    public readonly port: SerialPort;
    protected readonly crc16 = CRC.default("CRC16_CCIT_ZERO") as CRC;

    private _settings: VantInterfaceSettings = {
        path: null,
        baudRate: 19200,
    };

    public get settings() {
        return this._settings;
    }

    /**
     * Creates an interface to your vantage weather station (Vue, Pro, Pro 2). The device should be connected
     * serially. The passed device path specifies the path to communicate with the weather station. On Windows paths
     * like `COM1`, `COM2`, ... are common, on OSX devices common paths are `/dev/tty0`, `/dev/tty2`, ...
     *
     * To interact with the weather station use the {@link ready} function.
     *
     * Weather station dependent functionality (e.g. firmware version code for Vantage Pro 2 / Vue) is not supported on this interface.
     * Use {@link VantPro2Interface}, {@link VantProInterface} and {@link VantVueInterface} for station dependent features.
     *
     * @example
     * const device = new VantInterface("COM3");
     * device.ready(async () => {
     *    console.log("Connected successfully!");
     *
     *    const highsAndLows = await getHighsAndLows();
     *    console.log("The maximum temperature today was " + highsAndLows.tempOut.high + "°F at " + highsAndLows.tempOut.highTime + ".");
     * });
     * @param devicePath the serial path to your device
     */
    constructor(settings?: Partial<VantInterfaceSettings>) {
        super();

        this._settings = merge(this.settings, settings);

        if (!this.settings.path) {
            throw new MissingDevicePathError();
        }

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
     * Splits a buffer received from the console into the acknowledgement byte, the weather data itself and the two crc bytes.
     * @param buffer
     * @returns
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

    protected waitForBuffer = () => {
        return new Promise<Buffer>((resolve) => {
            this.port.once("data", (data: Buffer) => {
                resolve(data);
            });
        });
    };

    /**
     * Validates an acknowledgement byte.
     * @param buffer
     */
    protected validateAcknowledgementByte = (buffer: Buffer) => {
        const ack = buffer.readUInt8(0);
        if (ack == 0x06 || ack == 0x15) return;
        // 0x18 (not-ack) 0x21
        throw new MalformedDataError("Received invalid acknowledgement byte!");
    };

    /**
     * Computes the CRC value from the given buffer. Based on the CRC16_CCIT_ZERO standard.
     * @param dataBuffer
     * @returns the computed CRC value (2 byte, 16 bit)
     */
    protected computeCRC = (dataBuffer: Buffer) => {
        return this.crc16.compute(dataBuffer);
    };

    /**
     * Validates a buffer by computing its CRC value and comparing it to the exspected CRC value.
     * @param dataBuffer
     * @param exspectedCRC
     * @throws a MalformedDataError if the crc value is invalid
     */
    protected validateCRC = (dataBuffer: Buffer, exspectedCRC: number) => {
        const crc = this.computeCRC(dataBuffer);
        if (exspectedCRC === crc) return;
        else
            throw new MalformedDataError(
                "Received invalid CRC value. An error occurred during data transmission. Received malformed data."
            );
    };

    protected validatePort = () => {
        if (!this.port.isOpen) throw new ClosedConnectionError();
    };

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
     * Wakes up the weather station's console. This is necessary in order to send and receive data. The console automatically
     * falls asleep after two minutes of inactivity.
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
        this.validatePort();
        const data = await this.writeAndWaitForBuffer("TEST\n");
        return data.toString("utf-8", 2, 6) === "TEST";
    };

    /**
     * Gets the console's firmware date code.
     * @returns the console's firmware date code
     */
    public getFirmwareDateCode = async () => {
        this.validatePort();
        const data = await this.writeAndWaitForBuffer("VER\n");
        try {
            return data.toString("utf-8").split("OK")[1].trim();
        } catch (err) {
            throw new MalformedDataError("Received malformed data");
        }
    };

    /**
     * Closes the connection to the weather station (if it's open).
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
     * Gets the highs and lows of the recent time from the console.
     * @returns the highs and lows
     */
    public getHighsAndLows = async () => {
        this.validatePort();
        const data = await this.writeAndWaitForBuffer("HILOWS\n");

        // Check acknowledgment byte
        this.validateAcknowledgementByte(data);

        const splittedData = this.splitCRCAckDataPackage(data);

        // Check data (crc check)
        this.validateCRC(splittedData.weatherData, splittedData.crc);

        // Parse data
        const parsedWeatherData = new HighsAndLowsParser().parse(
            splittedData.weatherData
        );

        return parsedWeatherData;
    };

    /**
     * Gets the default (restructured) LOOP package of the weather station. The return value is dependend on the weather station's model.
     * @returns the default LOOP package of the weather station
     */
    public getDefaultLOOP = async () => {
        this.validatePort();
        const data = await this.writeAndWaitForBuffer("LOOP 1\n");
        // Check ack
        this.validateAcknowledgementByte(data);

        const packageType = data.readUInt8(5);
        if (packageType === 0) {
            const splittedData = this.splitCRCAckDataPackage(data);

            // Check data (crc check)
            this.validateCRC(splittedData.weatherData, splittedData.crc);

            return new LOOPParser().parse(splittedData.weatherData);
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

            return new LOOP2Parser().parse(splittedData.weatherData);
        }
    };

    public getSimpleRealtimeRecord = async () => {
        this.validatePort();

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
                direction: loopPackage.wind.direction,
            },
            rain: {
                rate: loopPackage.rain.rate,
                storm: loopPackage.rain.storm,
                stormStartDate: loopPackage.rain.stormStartDate,
                day: loopPackage.rain.day,
            },
            et: { day: loopPackage.et.day },
            uv: loopPackage.uv,
            solarRadiation: loopPackage.solarRadiation,
            time: new Date(),
        };
    };

    public isPortOpen = () => {
        return this.port.isOpen;
    };
}
