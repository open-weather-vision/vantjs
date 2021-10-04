import SerialPort from "serialport";
import VantError, { ErrorType } from "../errors/VantError";
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


export interface VantInterfaceOptions {
    rainCupType?: RainCup,
}
export default class VantInterface extends EventEmitter {
    protected readonly port: SerialPort;
    protected readonly crc16 = CRC.default("CRC16_CCIT_ZERO") as CRC;
    protected rainCupType: RainCup = RainCup.IN;
    public isClosed = false;

    /**
     * Creates an interface to your vantage weather station (Vue, Pro, Pro 2). After connecting the station wakes up automatically.
     * Listen to the awakening event once to start interacting with the station after connection. 
     * Weather station dependend functionality (e.g. firmware version code for Vantage Pro 2 / Vue) is not supported.
     * Use {@link VantPro2Interface}, {@link VantProInterface} and {@link VantVueInterface} for station dependend features.
     * @example
     * const myInterface = new VantInterface("COM3");
     * myInterface.once("awakening", async() => {
     *  const realtimeData = await myInterface.getRealtimeData();
     *  myInterface.close();
     * });
     * @param deviceUrl the serial url to your device
     * @param options additional options (e.g. rain cup size)
     */
    constructor(deviceUrl: string, options?: VantInterfaceOptions) {
        super();
        // Set options
        if (options?.rainCupType) this.rainCupType = options.rainCupType;

        // Init port
        this.port = new SerialPort(deviceUrl, { baudRate: 19200 });
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
        }
    }

    public ready(tr: () => Promise<void>, ca?: (reason: any) => Promise<void>, fi?: () => Promise<void>): void {
        if (!ca) ca = this._defaultErrorHandler;
        this.wakeUp().then(tr).catch(ca).finally(fi);
    }

    private async _defaultErrorHandler(reason: any) {
        console.error(reason);
    }

    /**
     * Validates an acknowledgement byte.
     * @param buffer 
     * @throws a DriverError if the byte is invalid
     */
    protected validateACK(buffer: Buffer) {
        const ack = buffer.readUInt8(0);
        if (ack == 0x06 || ack == 0x15) return;
        // 0x18 (not-ack) 0x21
        throw new MalformedDataError("An error occurred during data transmission. Received malformed data.");
    }

    /**
     * Computes the crc value from the given buffer. Based on the CRC16_CCIT_ZERO standard.
     * @param dataBuffer 
     * @returns the computed crc value (2 byte, 16 bit)
     */
    protected computeCRC(dataBuffer: Buffer): number {
        return this.crc16.compute(dataBuffer);
    }

    /**
     * Validates a buffer by computing its crc value and comparing it to the exspected crc value.
     * @param dataBuffer 
     * @param exspectedCRC 
     * @throws a DriverError if the crc value is invalid
     */
    protected validateCRC(dataBuffer: Buffer, exspectedCRC: number) {
        const crc = this.computeCRC(dataBuffer);
        if (exspectedCRC === crc) return;
        else throw new MalformedDataError("An error occurred during data transmission. Received malformed data.");
    }

    /**
     * Wakes up the console. This is necessary in order to send and receive data. The console automatically
     * falls asleep after two minutes of inactivity.
     */
    public async wakeUp(): Promise<void> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
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
                        }
                        else return resolve(false);
                    });
                });
            });
            tries++;
        } while (!succeeded && tries <= 3);
        if (!succeeded) throw new SerialConnectionError("Failed to wake up console!");
    }

    /**
     * Validates the connection to the console by running the TEST command. No error is thrown on failure, instead `false` is resolved.
     * @returns whether the connection is valid
     */
    public async validateConnection(): Promise<boolean> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
        return new Promise<boolean>((resolve) => {
            this.port.write("TEST\n", (err) => {
                if (err) resolve(false);
                this.port.once("data", (data: Buffer) => {
                    const response = data.toString("utf-8", 2, 6);
                    if (response === "TEST") resolve(true);
                    else resolve(false);
                });
            });
        })
    }

    /**
     * Gets the console's firmware date code.
     * @returns the console's firmware date code
     */
    public async getFirmwareDateCode(): Promise<string> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
        return new Promise<string>((resolve, reject) => {
            this.port.write("VER\n", (err) => {
                if (err) reject(new SerialConnectionError("Failed to send command to weather station."));
                this.port.once("data", (data: Buffer) => {
                    const response = data.toString("utf-8");
                    try {
                        const firmwareDateCode = response.split("OK")[1].trim();
                        resolve(firmwareDateCode);
                    } catch (err) {
                        reject(new MalformedDataError("Received malformed data"));
                    }
                });
            });
        })
    }

    /**
     * Closes the connection to the console.
     */
    public close(): void {
        this.port.close();
        this.isClosed = true;
        this.emit("close");
    }

    /**
     * Gets the highs and lows of the recent time from the console.
     * @returns the highs and lows
     */
    public async getHighsAndLows(): Promise<HighsAndLows> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
        return new Promise<HighsAndLows>((resolve, reject) => {
            this.port.write("HILOWS\n", (err) => {
                if (err) reject(new SerialConnectionError("Failed to send command to weather station."));
                this.port.once("data", (data: Buffer) => {
                    // Check ack
                    this.validateACK(data);

                    const splittedData = this.splitCRCAckDataPackage(data);

                    // Check data (crc check)
                    this.validateCRC(splittedData.weatherData, splittedData.crc);

                    // Parse data
                    const parsedWeatherData = new HighsAndLowsParser().parse(splittedData.weatherData);

                    resolve(parsedWeatherData);
                });
            });
        });
    }

    public async getDefaultLOOP(): Promise<LOOP | LOOP2> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
        return new Promise<LoopPackage>((resolve, reject) => {
            this.port.write("LOOP 1\n", (err) => {
                if (err) reject(new SerialConnectionError("Failed to send command to weather station."));
                this.port.once("data", (data: Buffer) => {
                    // Check ack
                    this.validateACK(data);

                    const packageType = data.readUInt8(5);
                    if (packageType === 0) {
                        const splittedData = this.splitCRCAckDataPackage(data);

                        // Check data (crc check)
                        this.validateCRC(splittedData.weatherData, splittedData.crc);

                        resolve(new LOOPParser().parse(splittedData.weatherData));
                    } else {
                        // LOOP 2 data is splitted (only tested on vantage pro 2)
                        const firstPartOfLOOP2 = data;
                        this.port.once("data", (data: Buffer) => {
                            const dataFull = Buffer.concat([firstPartOfLOOP2, data]);
                            const splittedData = this.splitCRCAckDataPackage(dataFull);

                            // Check data (crc check)
                            this.validateCRC(splittedData.weatherData, splittedData.crc);

                            resolve(new LOOP2Parser().parse(splittedData.weatherData));
                        });
                    }
                });
            });

        });
    }

    public async getSimpleRealtimeRecord(): Promise<SimpleRealtimeRecord> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
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
                }
            },
            temperature: {
                in: loopPackage.temperature.in,
                out: loopPackage.temperature.out,
            },
            humidity: {
                in: loopPackage.humidity.in,
                out: loopPackage.humidity.out
            },
            wind: {
                current: loopPackage.wind.current,
                avg: windAvg,
                direction: loopPackage.wind.direction
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

export enum RainCup {
    MM_SMALL = "0.1mm", MM_BIG = "0.2mm", IN = "0.01"
}
