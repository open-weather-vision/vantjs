import SerialPort from "serialport";
import DriverError, { ErrorType } from "./DriverError";
import * as util from "util";

function inspect(obj: any) {
    console.log(util.inspect(obj, false, null, true));
}

export default class VantageInterface {
    private readonly port: SerialPort;

    constructor(deviceUrl: string) {
        this.port = new SerialPort(deviceUrl, { baudRate: 19200 });
    }

    public async wakeUp(): Promise<void> {
        let succeeded = false;
        let tries = 0;
        do {
            succeeded = await new Promise((resolve, reject) => {
                this.port.write("\n", (err) => {
                    if (err) resolve(false);
                    this.port.on("readable", () => {
                        const response = String.raw`${this.port.read()}`;
                        if (response === "\n\r") resolve(true);
                        else resolve(false);
                    });
                });
            });
            tries++;
        } while (!succeeded && tries <= 3);
        if (!succeeded) throw new DriverError("Failed to wake up console!");
    }

    public async isAvailable(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.port.write("TEST\n", (err) => {
                if (err) resolve(false);
                this.port.on("data", (data: Buffer) => {
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
                this.port.on("data", (data: Buffer) => {
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
                this.port.on("data", (data: Buffer) => {
                    const response = data.toString("utf-8");
                    try {
                        const firmwareVersion = response.split("OK")[1].trim();
                        resolve(firmwareVersion);
                    } catch (err) {
                        reject(new DriverError("Failed to get firmware version", ErrorType.INVALID_RESPONSE));
                    }
                });
            });
        })
    }

    public async getHighsAndLows(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.port.write("HILOWS\n", (err) => {
                this.port.on("data", (data: Buffer) => {
                    const parsedData: any = {
                        pressure: {
                            day: {},
                            month: {},
                            year: {},
                        },
                        wind: {},
                        tempIn: {
                            day: {},
                            month: {},
                            year: {},
                        },
                        tempOut: {
                            day: {},
                            month: {},
                            year: {},
                        },
                        humIn: {
                            day: {},
                            month: {},
                            year: {},

                        },
                        dew: {
                            day: {},
                            month: {},
                            year: {},
                        },
                        chill: {},
                        heat: {},
                        THSW: {},
                        solarRad: {},
                        UV: {},
                        rainRate: {},
                        rainSum: {},
                    };
                    // PRESSURE in Hg
                    parsedData.pressure.day.low = data.readInt16LE(1) / 1000 || null;
                    if (!parsedData.pressure.day.low) parsedData.pressure.day.lowTime = null;
                    else parsedData.pressure.day.lowTime = data.readUInt16LE(13);
                    parsedData.pressure.day.high = data.readInt16LE(3) / 1000 || null;
                    if (!parsedData.pressure.day.high) parsedData.pressure.day.highTime = null;
                    else parsedData.pressure.day.highTime = data.readUInt16LE(15);
                    parsedData.pressure.month.low = data.readInt16LE(5) / 1000 || null;
                    parsedData.pressure.month.high = data.readInt16LE(7) / 1000 || null;
                    parsedData.pressure.year.low = data.readInt16LE(9) / 1000 || null;
                    parsedData.pressure.year.high = data.readInt16LE(11) / 1000 || null;
                    // WIND in mph
                    parsedData.wind.day = data.readUIntLE(17, 1);
                    parsedData.wind.dayTime = data.readUInt16LE(18);
                    parsedData.wind.month = data.readUIntLE(20, 1);
                    parsedData.wind.year = data.readUIntLE(21, 1);
                    // INSIDE TEMPERATURE in °F
                    parsedData.tempIn.day.low = data.readInt16LE(24) / 10;
                    parsedData.tempIn.day.lowTime = data.readInt16LE(28);
                    parsedData.tempIn.day.high = data.readInt16LE(22) / 10;
                    parsedData.tempIn.day.highTime = data.readInt16LE(26);
                    parsedData.tempIn.month.high = data.readInt16LE(30) / 10;
                    parsedData.tempIn.month.low = data.readInt16LE(32) / 10;
                    parsedData.tempIn.year.high = data.readInt16LE(34) / 10;
                    parsedData.tempIn.year.low = data.readInt16LE(36) / 10;
                    // INSIDE HUMIDITY in %
                    parsedData.humIn.day.low = data.readUInt8(39) || null;
                    if (!parsedData.humIn.day.low) parsedData.humIn.day.lowTime = null;
                    else parsedData.humIn.day.lowTime = data.readInt16LE(42);
                    parsedData.humIn.day.high = data.readUInt8(38) || null;
                    if (!parsedData.humIn.day.high) parsedData.humIn.day.highTime = null;
                    else parsedData.humIn.day.highTime = data.readInt16LE(40);
                    parsedData.humIn.month.high = data.readUInt8(44) || null;
                    parsedData.humIn.month.low = data.readUInt8(45) || null;
                    parsedData.humIn.year.high = data.readUInt8(46) || null;
                    parsedData.humIn.year.low = data.readUInt8(47) || null;
                    // OUTSIDE TEMPERATURE in °F
                    parsedData.tempOut.day.low = data.readInt16LE(48) / 10;
                    parsedData.tempOut.day.lowTime = data.readInt16LE(52);
                    parsedData.tempOut.day.high = data.readInt16LE(50) / 10;
                    parsedData.tempOut.day.highTime = data.readInt16LE(54);
                    parsedData.tempOut.month.high = data.readInt16LE(56) / 10;
                    parsedData.tempOut.month.low = data.readInt16LE(58) / 10;
                    parsedData.tempOut.year.high = data.readInt16LE(60) / 10;
                    parsedData.tempOut.year.low = data.readInt16LE(62) / 10;
                    // DEW POINT in °F
                    parsedData.dew.day.low = data.readInt16LE(64);
                    parsedData.dew.day.lowTime = data.readInt16LE(68);
                    parsedData.dew.day.high = data.readInt16LE(66);
                    parsedData.dew.day.highTime = data.readInt16LE(70);
                    parsedData.dew.month.high = data.readInt16LE(72);
                    parsedData.dew.month.low = data.readInt16LE(74);
                    parsedData.dew.year.high = data.readInt16LE(76);
                    parsedData.dew.year.low = data.readInt16LE(78);
                    // WIND CHILL in °F
                    parsedData.chill.day = data.readInt16LE(80);
                    parsedData.chill.dayTime = data.readInt16LE(82);
                    parsedData.chill.month = data.readInt16LE(84);
                    parsedData.chill.year = data.readInt16LE(86);
                    // HEAT INDEX in °F
                    parsedData.heat.day = data.readInt16LE(88);
                    parsedData.heat.dayTime = data.readInt16LE(90);
                    parsedData.heat.month = data.readInt16LE(92);
                    parsedData.heat.year = data.readInt16LE(94);
                    // THSW INDEX in °F
                    parsedData.THSW.day = data.readInt16LE(96);
                    if (parsedData.THSW.day < 0) parsedData.THSW.day = null;
                    parsedData.THSW.dayTime = data.readInt16LE(97);
                    if (parsedData.THSW.dayTime < 0) parsedData.THSW.dayTime = null;
                    parsedData.THSW.month = data.readInt16LE(100);
                    if (parsedData.THSW.month < 0) parsedData.THSW.month = null;
                    parsedData.THSW.year = data.readInt16LE(102);
                    if (parsedData.THSW.year < 0) parsedData.THSW.year = null;
                    // SOLAR RADIATION in W/m²
                    parsedData.solarRad.day = data.readUInt16LE(104) || null;
                    if (!parsedData.solarRad.day) parsedData.solarRad.dayTime = null;
                    else parsedData.solarRad.dayTime = data.readUInt16LE(106);
                    parsedData.solarRad.month = data.readUInt16LE(108) || null;
                    parsedData.solarRad.year = data.readUInt16LE(110) || null;
                    // UV Index
                    parsedData.UV.day = data.readUInt8(112) || null;
                    if (!parsedData.UV.day) parsedData.UV.dayTime = null;
                    else parsedData.UV.dayTime = data.readUInt16LE(113);
                    parsedData.UV.month = data.readUInt8(115) || null;
                    parsedData.UV.year = data.readUInt8(116) || null;
                    // RAIN RATE in cups/hr
                    parsedData.rainRate.day = data.readUInt16LE(117);
                    parsedData.rainRate.dayTime = data.readUInt16LE(119);
                    parsedData.rainRate.month = data.readUInt16LE(121);
                    // RAIN SUM in cups
                    parsedData.rainSum.month = data.readUInt16LE(123);
                    parsedData.rainSum.year = data.readUInt16LE(125);
                    inspect(parsedData);
                })
            })
        })
    }

}