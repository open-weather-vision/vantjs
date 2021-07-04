import SerialPort from "serialport";
import DriverError, { ErrorType } from "./DriverError";
import { EventEmitter } from "stream";
import BinaryParser, { Type } from "./util/BinaryParser";



export default class VantageInterface extends EventEmitter {
    private readonly port: SerialPort;

    constructor(deviceUrl: string) {
        super();
        this.port = new SerialPort(deviceUrl, { baudRate: 19200 });
        this.port.on("error", (err) => this.emit("error", err));
        this.port.on("open", () => this.emit("connection"));
        this.wakeUp();
    }

    public async wakeUp(): Promise<void> {
        let succeeded = false;
        let tries = 0;
        do {
            succeeded = await new Promise<boolean>((resolve, reject) => {
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

    public async checkConnection(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
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
     * only works on vantage pro 2 / vantage vue
     */
    public async getFirmwareVersion(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.port.write("NVER\n", (err) => {
                if (err) reject(new DriverError("Failed to get firmware version", ErrorType.FAILED_TO_WRITE));
                this.port.once("data", (data: Buffer) => {
                    const response = data.toString("utf-8");
                    try {
                        const firmwareVersion = response.split("OK")[1].trim();
                        resolve(`v${firmwareVersion}`);
                    } catch (err) {
                        reject(new DriverError("Failed to get firmware version", ErrorType.INVALID_RESPONSE));
                    }
                });
            });
        })
    }

    public close(): void {
        this.port.close();
    }

    public async getHighsAndLows(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.port.write("HILOWS\n", (err) => {
                if (err) reject(new DriverError("Failed to get highs and lows", ErrorType.FAILED_TO_WRITE));
                this.port.once("data", (data: Buffer) => {
                    const parser = new BinaryParser({
                        pressure: {
                            day: {
                                low: { type: Type.UINT16, position: 0, nullables: "pressure", transform: "pressure", dependsOn: "lowTime" },
                                high: { type: Type.UINT16, position: 2, nullables: "pressure", transform: "pressure", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 12, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 14, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.UINT16, position: 4, nullables: "pressure", transform: "pressure" },
                                high: { type: Type.UINT16, position: 6, nullables: "pressure", transform: "pressure" },
                            },
                            year: {
                                low: { type: Type.UINT16, position: 8, nullables: "pressure", transform: "pressure" },
                                high: { type: Type.UINT16, position: 10, nullables: "pressure", transform: "pressure" },
                            }
                        },
                        wind: {
                            day: { type: Type.UINT8, position: 16, dependsOn: "dayTime" },
                            dayTime: { type: Type.UINT16, position: 17, nullables: "time", transform: "time", dependsOn: "day" },
                            month: { type: Type.UINT8, position: 19 },
                            year: { type: Type.UINT8, position: 20 }
                        },
                        tempIn: {
                            day: {
                                low: { type: Type.INT16, position: 23, nullables: "tempLow", transform: "temperature", dependsOn: "lowTime" },
                                high: { type: Type.INT16, position: 21, nullables: "tempHigh", transform: "temperature", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 27, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 25, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.INT16, position: 29, nullables: "tempLow", transform: "temperature" },
                                high: { type: Type.INT16, position: 31, nullables: "tempHigh", transform: "temperature" },
                            },
                            year: {
                                low: { type: Type.INT16, position: 33, nullables: "tempLow", transform: "temperature" },
                                high: { type: Type.INT16, position: 35, nullables: "tempHigh", transform: "temperature" },
                            }
                        },
                        humIn: {
                            day: {
                                low: { type: Type.UINT8, position: 38, nullables: "humidity", dependsOn: "lowTime" },
                                high: { type: Type.UINT8, position: 37, nullables: "humidity", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 41, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 39, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.UINT8, position: 44, nullables: "humidity" },
                                high: { type: Type.UINT8, position: 43, nullables: "humidity" },
                            },
                            year: {
                                low: { type: Type.UINT8, position: 46, nullables: "humidity" },
                                high: { type: Type.UINT8, position: 45, nullables: "humidity" },
                            }
                        },
                        tempOut: {
                            day: {
                                low: { type: Type.INT16, position: 47, nullables: "tempLow", transform: "temperature", dependsOn: "lowTime" },
                                high: { type: Type.INT16, position: 49, nullables: "tempHigh", transform: "temperature", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 51, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 53, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.INT16, position: 57, nullables: "tempLow", transform: "temperature" },
                                high: { type: Type.INT16, position: 55, nullables: "tempHigh", transform: "temperature" },
                            },
                            year: {
                                low: { type: Type.INT16, position: 61, nullables: "tempLow", transform: "temperature" },
                                high: { type: Type.INT16, position: 59, nullables: "tempHigh", transform: "temperature" },
                            }
                        },
                        dew: {
                            day: {
                                low: { type: Type.INT16, position: 63, nullables: "tempLow", dependsOn: "lowTime" },
                                high: { type: Type.INT16, position: 65, nullables: "tempHigh", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 67, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 69, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.INT16, position: 73, nullables: "tempLow" },
                                high: { type: Type.INT16, position: 71, nullables: "tempHigh" },
                            },
                            year: {
                                low: { type: Type.INT16, position: 77, nullables: "tempLow" },
                                high: { type: Type.INT16, position: 75, nullables: "tempHigh" },
                            }
                        },
                        chill: {
                            day: { type: Type.INT16, position: 79, nullables: "chill", dependsOn: "dayTime" },
                            dayTime: { type: Type.UINT16, position: 81, nullables: "time", transform: "time", dependsOn: "day" },
                            month: { type: Type.INT16, position: 83, nullables: "chill" },
                            year: { type: Type.INT16, position: 85, nullables: "chill" }
                        },
                        heat: {
                            day: { type: Type.INT16, position: 87, nullables: "heat", dependsOn: "dayTime" },
                            dayTime: { type: Type.UINT16, position: 89, nullables: "time", transform: "time", dependsOn: "day" },
                            month: { type: Type.INT16, position: 91, nullables: "heat" },
                            year: { type: Type.INT16, position: 93, nullables: "heat" }
                        },
                        thsw: {
                            day: { type: Type.INT16, position: 95, nullables: "thsw", dependsOn: "dayTime" },
                            dayTime: { type: Type.UINT16, position: 97, nullables: "time", transform: "time", dependsOn: "day" },
                            month: { type: Type.INT16, position: 99, nullables: "thsw" },
                            year: { type: Type.INT16, position: 101, nullables: "thsw" }
                        },
                        solarRadiation: {
                            month: { type: Type.UINT16, position: 107, nullables: "solar" },
                            year: { type: Type.UINT16, position: 109, nullables: "solar" },
                            day: { type: Type.UINT16, position: 103, nullables: "solar", dependsOn: "dayTime" },
                            dayTime: { type: Type.UINT16, position: 105, nullables: "time", transform: "time", dependsOn: "day" },
                        },
                        uv: {
                            month: { type: Type.UINT8, position: 114, transform: "uv" },
                            year: { type: Type.UINT8, position: 115, transform: "uv" },
                            day: { type: Type.UINT8, position: 111, dependsOn: "dayTime", transform: "uv" },
                            dayTime: { type: Type.UINT16, position: 112, nullables: "time", transform: "time", dependsOn: "day" },
                        },
                        rainRate: {
                            month: { type: Type.UINT16, position: 120 },
                            day: { type: Type.UINT16, position: 116, dependsOn: "dayTime" },
                            dayTime: { type: Type.UINT16, position: 118, nullables: "time", transform: "time", dependsOn: "day" },
                        },
                        rainSum: {
                            month: { type: Type.UINT16, position: 122 },
                            year: { type: Type.UINT16, position: 124 },
                        },
                        extraTemp: [{
                            day: {
                                low: { type: Type.UINT8, position: 126, nullables: "extraTemp", transform: "extraTemp", dependsOn: "lowTime" },
                                high: { type: Type.UINT8, position: 141, nullables: "extraTemp", transform: "extraTemp", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 156, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 186, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.UINT8, position: 231, nullables: "extraTemp", transform: "extraTemp" },
                                high: { type: Type.UINT8, position: 216, nullables: "extraTemp", transform: "extraTemp" },
                            },
                            year: {
                                low: { type: Type.UINT8, position: 261, nullables: "extraTemp", transform: "extraTemp" },
                                high: { type: Type.UINT8, position: 246, nullables: "extraTemp", transform: "extraTemp" },
                            }
                        }, 7],
                        soilTemp: [{
                            day: {
                                low: { type: Type.UINT8, position: 133, nullables: "soilTemp", transform: "soilTemp", dependsOn: "lowTime" },
                                high: { type: Type.UINT8, position: 148, nullables: "soilTemp", transform: "soilTemp", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 163, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 193, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.UINT8, position: 238, nullables: "soilTemp", transform: "soilTemp" },
                                high: { type: Type.UINT8, position: 223, nullables: "soilTemp", transform: "soilTemp" },
                            },
                            year: {
                                low: { type: Type.UINT8, position: 268, nullables: "soilTemp", transform: "soilTemp" },
                                high: { type: Type.UINT8, position: 253, nullables: "soilTemp", transform: "soilTemp" },
                            }
                        }, 4],
                        leafTemp: [{
                            day: {
                                low: { type: Type.UINT8, position: 137, nullables: "leafTemp", transform: "leafTemp", dependsOn: "lowTime" },
                                high: { type: Type.UINT8, position: 152, nullables: "leafTemp", transform: "leafTemp", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 167, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 197, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.UINT8, position: 242, nullables: "leafTemp", transform: "leafTemp" },
                                high: { type: Type.UINT8, position: 227, nullables: "leafTemp", transform: "leafTemp" },
                            },
                            year: {
                                low: { type: Type.UINT8, position: 272, nullables: "leafTemp", transform: "leafTemp" },
                                high: { type: Type.UINT8, position: 257, nullables: "leafTemp", transform: "leafTemp" },
                            }
                        }, 4],
                        extraHums: [{
                            day: {
                                low: { type: Type.UINT8, position: 276, nullables: "humidity", dependsOn: "lowTime" },
                                high: { type: Type.UINT8, position: 284, nullables: "humidity", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 292, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 308, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.UINT8, position: 332, nullables: "humidity" },
                                high: { type: Type.UINT8, position: 324, nullables: "humidity" },
                            },
                            year: {
                                low: { type: Type.UINT8, position: 348, nullables: "humidity" },
                                high: { type: Type.UINT8, position: 340, nullables: "humidity" },
                            }
                        }, 8],
                        soilMoistures: [{
                            day: {
                                low: { type: Type.UINT8, position: 368, nullables: "soilMoisture", dependsOn: "lowTime" },
                                high: { type: Type.UINT8, position: 356, nullables: "soilMoisture", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 372, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 360, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.UINT8, position: 380, nullables: "soilMoisture" },
                                high: { type: Type.UINT8, position: 384, nullables: "soilMoisture" },
                            },
                            year: {
                                low: { type: Type.UINT8, position: 388, nullables: "soilMoisture" },
                                high: { type: Type.UINT8, position: 392, nullables: "soilMoisture" },
                            }
                        }, 4],
                        leafWetnesses: [{
                            day: {
                                low: { type: Type.UINT8, position: 408, nullables: "leafWetness", dependsOn: "lowTime" },
                                high: { type: Type.UINT8, position: 396, nullables: "leafWetness", dependsOn: "highTime" },
                                lowTime: { type: Type.UINT16, position: 412, nullables: "time", transform: "time", dependsOn: "low" },
                                highTime: { type: Type.UINT16, position: 400, nullables: "time", transform: "time", dependsOn: "high" },
                            },
                            month: {
                                low: { type: Type.UINT8, position: 420, nullables: "leafWetness" },
                                high: { type: Type.UINT8, position: 424, nullables: "leafWetness" },
                            },
                            year: {
                                low: { type: Type.UINT8, position: 428, nullables: "leafWetness" },
                                high: { type: Type.UINT8, position: 432, nullables: "leafWetness" },
                            }
                        }, 4],
                    }, 1);
                    parser.setTransformer("pressure", (value) => value / 1000);
                    parser.setTransformer("temperature", (value) => value / 10);
                    parser.setTransformer("time", (value) => {
                        const stringValue = value.toString();
                        switch (stringValue.length) {
                            case 1: return `00:0${stringValue}`;
                            case 2: return `00:${stringValue}`;
                            case 3: return `0${stringValue.charAt(0)}:${stringValue.substring(1)}`;
                            case 4: return `${stringValue.substring(0, 2)}:${stringValue.substring(2)}`;
                        }
                        return value;
                    });
                    parser.setTransformer("uv", (value) => value / 10);
                    parser.setTransformer("extraTemp", (value) => value - 90);
                    parser.setTransformer("soilTemp", (value) => value - 90);
                    parser.setTransformer("leafTemp", (value) => value - 90);
                    parser.setNullables("pressure", [0]);
                    parser.setNullables("humidity", [0, 255]);
                    parser.setNullables("time", [65535]);
                    parser.setNullables("tempLow", [32767]);
                    parser.setNullables("tempHigh", [-32768]);
                    parser.setNullables("heat", [-32768]);
                    parser.setNullables("thsw", [-32768]);
                    parser.setNullables("chill", [32768]);
                    parser.setNullables("solar", [32768]);
                    parser.setNullables("extraTemp", [255]);
                    parser.setNullables("soilTemp", [255]);
                    parser.setNullables("leafTemp", [255]);
                    parser.setNullables("leafWetness", [255]);
                    parser.setNullables("soilMoisture", [255]);

                    const parsedData = parser.parse(data);
                    parsedData.humOut = parsedData.extraHums.shift();
                    resolve(parsedData);
                });
            });
        });
    }

}