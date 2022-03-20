import { SerialPort } from "serialport";
import { CRC } from "crc-full";
import HighsAndLowsParser from "../parsers/HighsAndLowsParser";
import { HighsAndLows } from "../structures/HighsAndLows";
import LOOPParser from "../parsers/LOOPParser";
import LOOP2Parser from "../parsers/LOOP2Parser";
import { LoopPackage, LOOP, LOOP2 } from "../structures/LOOP";

import { SimpleRealtimeRecord as SimpleRealtimeRecord } from "../structures/SimpleRealtimeRecord";
import SerialConnectionError from "../errors/SerialConnectionError";
import { EventEmitter } from "stream";
import MalformedDataError from "../errors/MalformedDataError";
import ClosedConnectionError from "../errors/ClosedConnectionError";
import FailedToSendCommandError from "../errors/FailedToSendCommandError";

/**
 * Interface to _any vantage weather station_ (Vue, Pro, Pro 2). The device must be connected serially.
 * To interact with the weather station create an instance of this class and use the {@link ready} function.
 *
 * This interface is limited to station independent features.
 * Use {@link VantPro2Interface}, {@link VantProInterface} and {@link VantVueInterface} for station dependent features.
 */
export default class VantInterface extends EventEmitter {
    protected readonly port: SerialPort;
    protected readonly crc16 = CRC.default("CRC16_CCIT_ZERO") as CRC;

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
    constructor(devicePath: string) {
        super();
        this.port = new SerialPort({ path: devicePath, baudRate: 19200 });
    }

    /**
     * Splits a buffer received from the console into the acknowledgement byte, the weather data itself and the two crc bytes.
     * @param buffer
     * @returns
     */
    protected splitCRCAckDataPackage(buffer: Buffer) {
        const bufferCopy = Buffer.alloc(buffer.length - 3);
        buffer.copy(bufferCopy, 0, 1, buffer.length - 2);
        return {
            ack: buffer.readUInt8(0),
            weatherData: bufferCopy,
            crc: buffer.readUInt16BE(buffer.length - 2),
        };
    }

    /**
     * Wakes up the weather station (this is necessary in order to send and receive data), then executes the first passed method asynchronously.
     * This method is the right place to access weather data from the weather station.
     * Be aware that after 2 minutes of inactivity, the weather station will fall asleep and must be woken up again via {@link wakeUp}.
     *
     * Optionally you can pass a second method, the error handler. It gets called if an uncatched error is thrown in the
     * first passed method. The default error handler logs the error to the console.
     *
     * Optionally you can pass a third method that gets called finally. By default is closes the connection to the weather station
     * (if it is not already closed).
     *
     * @example
     * const device = new VantInterface("COM3");
     * device.ready(
     *  // gets called when the weather station is ready
     *  async () => {
     *      console.log("Connected successfully!");
     *
     *      const highsAndLows = await getHighsAndLows();
     *      console.log("The maximum temperature today was " + highsAndLows.tempOut.high + "°F");
     *  },
     *  // gets called if an error occurrs (optional)
     *  async(err) => {
     *          MyOwnLogger.log(err);
     *  },
     *  // gets called finally (optional)
     *  async() => {
     *      device.close();
     *      console.log("Finished :)");
     *  }
     * );
     * @param tr
     * @param ca
     * @param fi
     */
    public ready(
        tr: () => Promise<void>,
        ca?: (error: any) => Promise<void>,
        fi?: () => Promise<void>
    ): void {
        if (!ca) ca = this._defaultErrorHandler;
        if (!fi) fi = this._defaultFinallyHandler;
        this.wakeUp().then(tr).catch(ca).finally(fi);
    }

    private _defaultErrorHandler = async (error: any) => {
        console.error(error);
    };

    private _defaultFinallyHandler = async () => {
        this.close();
    };

    /**
     * Validates an acknowledgement byte.
     * @param buffer
     * @throws a MalformedDataError if the byte is invalid
     */
    protected validateACK(buffer: Buffer) {
        const ack = buffer.readUInt8(0);
        if (ack == 0x06 || ack == 0x15) return;
        // 0x18 (not-ack) 0x21
        throw new MalformedDataError("Received invalid acknowledgement byte!");
    }

    /**
     * Computes the CRC value from the given buffer. Based on the CRC16_CCIT_ZERO standard.
     * @param dataBuffer
     * @returns the computed CRC value (2 byte, 16 bit)
     */
    protected computeCRC(dataBuffer: Buffer): number {
        return this.crc16.compute(dataBuffer);
    }

    /**
     * Validates a buffer by computing its CRC value and comparing it to the exspected CRC value.
     * @param dataBuffer
     * @param exspectedCRC
     * @throws a MalformedDataError if the crc value is invalid
     */
    protected validateCRC(dataBuffer: Buffer, exspectedCRC: number) {
        const crc = this.computeCRC(dataBuffer);
        if (exspectedCRC === crc) return;
        else
            throw new MalformedDataError(
                "Received invalid CRC value. An error occurred during data transmission. Received malformed data."
            );
    }

    /**
     * Wakes up the weather station's console. This is necessary in order to send and receive data. The console automatically
     * falls asleep after two minutes of inactivity.
     */
    public async wakeUp(): Promise<void> {
        if (!this.port.isOpen) throw new ClosedConnectionError();
        let succeeded = false;
        let tries = 0;
        do {
            succeeded = await new Promise<boolean>((resolve) => {
                this.port.write("\n", (err) => {
                    if (err) {
                        return resolve(false);
                    }
                    this.port.once("readable", () => {
                        const response = String.raw`${this.port.read()}`;
                        if (response === "\n\r") {
                            this.emit("ready");
                            return resolve(true);
                        } else return resolve(false);
                    });
                });
            });
            tries++;
        } while (!succeeded && tries <= 3);
        if (!succeeded)
            throw new SerialConnectionError("Failed to wake up console!");
    }

    /**
     * Validates the connection to the console by running the TEST command. No error is thrown on failure, instead `false` is resolved.
     * @returns whether the connection is valid
     */
    public async validateConnection(): Promise<boolean> {
        if (!this.port.isOpen) throw new ClosedConnectionError();
        return new Promise<boolean>((resolve) => {
            this.port.write("TEST\n", (err) => {
                if (err) resolve(false);
                this.port.once("data", (data: Buffer) => {
                    const response = data.toString("utf-8", 2, 6);
                    if (response === "TEST") resolve(true);
                    else resolve(false);
                });
            });
        });
    }

    /**
     * Gets the console's firmware date code.
     * @returns the console's firmware date code
     */
    public async getFirmwareDateCode(): Promise<string> {
        if (!this.port.isOpen) throw new ClosedConnectionError();
        return new Promise<string>((resolve, reject) => {
            this.port.write("VER\n", (err) => {
                if (err) reject(new FailedToSendCommandError());
                this.port.once("data", (data: Buffer) => {
                    const response = data.toString("utf-8");
                    try {
                        const firmwareDateCode = response.split("OK")[1].trim();
                        resolve(firmwareDateCode);
                    } catch (err) {
                        reject(
                            new MalformedDataError("Received malformed data")
                        );
                    }
                });
            });
        });
    }

    /**
     * Closes the connection to the weather station (if it's open).
     */
    public close(): void {
        if (this.port.isOpen) {
            this.port.close();
            this.emit("close");
        }
    }

    /**
     * Gets the highs and lows of the recent time from the console.
     * @returns the highs and lows
     */
    public async getHighsAndLows(): Promise<HighsAndLows> {
        if (!this.port.isOpen) throw new ClosedConnectionError();
        return new Promise<HighsAndLows>((resolve, reject) => {
            this.port.write("HILOWS\n", (err) => {
                if (err) reject(new FailedToSendCommandError());
                this.port.once("data", (data: Buffer) => {
                    // Check ack
                    this.validateACK(data);

                    const splittedData = this.splitCRCAckDataPackage(data);

                    // Check data (crc check)
                    this.validateCRC(
                        splittedData.weatherData,
                        splittedData.crc
                    );

                    // Parse data
                    const parsedWeatherData = new HighsAndLowsParser().parse(
                        splittedData.weatherData
                    );

                    resolve(parsedWeatherData);
                });
            });
        });
    }

    /**
     * Gets the default (restructured) LOOP package of the weather station. The return value is dependend on the weather station's model.
     * @returns the default LOOP package of the weather station
     */
    public async getDefaultLOOP(): Promise<LOOP | LOOP2> {
        if (!this.port.isOpen) throw new ClosedConnectionError();
        return new Promise<LoopPackage>((resolve, reject) => {
            this.port.write("LOOP 1\n", (err) => {
                if (err) reject(new FailedToSendCommandError());
                this.port.once("data", (data: Buffer) => {
                    // Check ack
                    this.validateACK(data);

                    const packageType = data.readUInt8(5);
                    if (packageType === 0) {
                        const splittedData = this.splitCRCAckDataPackage(data);

                        // Check data (crc check)
                        this.validateCRC(
                            splittedData.weatherData,
                            splittedData.crc
                        );

                        resolve(
                            new LOOPParser().parse(splittedData.weatherData)
                        );
                    } else {
                        // LOOP 2 data is splitted (only tested on vantage pro 2)
                        const firstPartOfLOOP2 = data;
                        this.port.once("data", (data: Buffer) => {
                            const dataFull = Buffer.concat([
                                firstPartOfLOOP2,
                                data,
                            ]);
                            const splittedData =
                                this.splitCRCAckDataPackage(dataFull);

                            // Check data (crc check)
                            this.validateCRC(
                                splittedData.weatherData,
                                splittedData.crc
                            );

                            resolve(
                                new LOOP2Parser().parse(
                                    splittedData.weatherData
                                )
                            );
                        });
                    }
                });
            });
        });
    }

    /**
     * Gets some basic weather data like _pressure_ (current and trend), _temperature_ (in and out), _humidity_ (in and out),
     * _wind_ (current, avg, direction), _rain_ (rate/h, day sum, storm information), _et_, _uv_, _solar radiation_ and _time_.
     * A `null` value is a placeholder for "no signal".
     * @returns some basic weather data
     */
    public async getSimpleRealtimeRecord(): Promise<SimpleRealtimeRecord> {
        if (!this.port.isOpen) throw new ClosedConnectionError();
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
    }
}
