import SerialPort from "serialport";
import DriverError, { ErrorType } from "../DriverError";
import { EventEmitter } from "stream";
import { CRC } from "crc-full";
import HighsAndLowsParser from "../parsers/HighsAndLowsParser";
import { HighsAndLows } from "../structures/HighsAndLows";
import LOOPParser from "../parsers/LOOPParser";
import LOOP2Parser from "../parsers/LOOP2Parser";
import { RealtimeData, RealtimePackage } from "../structures/RealtimeData";

import VantPro2Interface from "./VantPro2Interface";
import VantProInterface from "./VantProInterface";
import VantVueInterface from "./VantVueInterface";


export interface VantInterfaceOptions {
    rainCupType?: RainCup,
}
export default class VantInterface extends EventEmitter {
    protected readonly port: SerialPort;
    protected readonly crc16 = CRC.default("CRC16_CCIT_ZERO") as CRC;
    protected rainCupType: RainCup = RainCup.IN;

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

        // Setup event listeners / emitters
        this.port.on("error", (err) => this.emit("error", err));
        this.port.on("open", () => this.emit("connection"));

        // Wake station up
        this.wakeUp();
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

    protected validateACK(buffer: Buffer) {
        const ack = buffer.readUInt8(0);
        if (ack == 0x06 || ack == 0x15) return;
        else if (ack == 0x21) throw new DriverError("Something went wrong", ErrorType.NOT_ACK);
        else if (ack == 0x18) throw new DriverError("An error occurred during transmission", ErrorType.CRC);
    }

    /**
     * Computes the crc value for the given buffer. Based on the CRC16_CCIT_ZERO standard.
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
     * @returns whether the buffer is valid
     */
    protected validateCRC(dataBuffer: Buffer, exspectedCRC: number) {
        const crc = this.computeCRC(dataBuffer);
        if (exspectedCRC === crc) return;
        else throw new DriverError("Received malformed data", ErrorType.CRC);
    }

    /**
     * Wakes up the console. This is necessary in order to send and receive data. The console automatically
     * falls asleep after two minutes of inactivity.
     */
    public async wakeUp(): Promise<void> {
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
                            this.emit("awakening");
                            return resolve(true);
                        }
                        else return resolve(false);
                    });
                });
            });
            tries++;
        } while (!succeeded && tries <= 3);
        if (!succeeded) throw new DriverError("Failed to wake up console!", ErrorType.CONNECTION);
    }

    /**
     * Validates the connection to the console.
     * @returns whether the connection is valid
     */
    public async validateConnection(): Promise<boolean> {
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
        return new Promise<string>((resolve, reject) => {
            this.port.write("VER\n", (err) => {
                if (err) reject(new DriverError("Failed to get firmware date code", ErrorType.FAILED_TO_WRITE));
                this.port.once("data", (data: Buffer) => {
                    const response = data.toString("utf-8");
                    try {
                        const firmwareDateCode = response.split("OK")[1].trim();
                        resolve(firmwareDateCode);
                    } catch (err) {
                        reject(new DriverError("Failed to get firmware date code", ErrorType.INVALID_RESPONSE));
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
    }

    /**
     * Gets the highs and lows of the recent time from the console.
     * @returns the highs and lows
     */
    public async getHighsAndLows(): Promise<HighsAndLows> {
        return new Promise<any>((resolve, reject) => {
            this.port.write("HILOWS\n", (err) => {
                if (err) reject(new DriverError("Failed to get highs and lows", ErrorType.FAILED_TO_WRITE));
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

    /**
     * Gets the currently measured weather data. There are two types of realtime data available called `LOOP` and `LOOP2`.
     * Default is mostly LOOP. LOOP provides information about the alarm settings, LOOP2 holds additional graph data.
     * @param packageType the type of realtime data to get (`RealtimePackage.LOOP` or `RealtimePackage.LOOP2`)
     * @returns the currently measured weather data
     */
    public async getRealtimeData(packageType?: RealtimePackage): Promise<RealtimeData> {
        return new Promise<any>((resolve, reject) => {
            let stringToWrite;
            if (packageType) {
                stringToWrite = "LPS ";
                if (packageType === RealtimePackage.LOOP) stringToWrite += "1 1";
                else if (packageType === RealtimePackage.LOOP2) stringToWrite += "2 1";
                else stringToWrite += "3 2";
                stringToWrite += "\n";
            } else {
                stringToWrite = "LOOP 1\n";
            }
            this.port.write(stringToWrite, (err) => {
                if (err) reject(new DriverError("Failed to get realtime data", ErrorType.FAILED_TO_WRITE));
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
}

export enum RainCup {
    MM_SMALL = "0.1mm", MM_BIG = "0.2mm", IN = "0.01"
}
