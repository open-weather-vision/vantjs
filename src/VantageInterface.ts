import SerialPort from "serialport";
import DriverError, { ErrorType } from "./DriverError";
import { EventEmitter } from "stream";



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

    public async getHighsAndLows(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.port.write("HILOWS\n", (err) => {
                this.port.once("data", (data: Buffer) => {
                    return;
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
                        humOut: {},
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
                        temps: [],
                        hums: [],
                        soilTemps: [],
                        leafTemps: [],
                        leafWetnesses: [],
                        soilMoistures: [],
                    };
                    // PRESSURE in Hg
                    this.parsePressure(data, parsedData);


                    // WIND in mph
                    this.parseWind(data, parsedData);


                    // INSIDE TEMPERATURE in °F
                    this.parseInsideTemperature(data, parsedData);

                    // INSIDE HUMIDITY in %
                    this.parseInsideHumidity(data, parsedData);

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

                    const solarDayTime = data.readUInt16LE(106);
                    parsedData.solarRad.dayTime = solarDayTime === 65535 ? null : solarDayTime;
                    if (parsedData.solarRad.dayTime !== null) parsedData.solarRad.day = data.readUInt8(104);
                    else parsedData.solarRad.day = null;
                    parsedData.solarRad.month = data.readUInt16LE(108);
                    parsedData.solarRad.year = data.readUInt16LE(110);


                    // UV Index
                    const uvDayTime = data.readUInt16LE(113);
                    parsedData.UV.dayTime = uvDayTime === 65535 ? null : uvDayTime;
                    if (parsedData.UV.dayTime !== null) parsedData.UV.day = data.readUInt8(112);
                    else parsedData.UV.day = null;
                    parsedData.UV.month = data.readUInt8(115);
                    parsedData.UV.year = data.readUInt8(116);


                    // RAIN RATE in cups/hr
                    parsedData.rainRate.day = data.readUInt16LE(117);
                    parsedData.rainRate.dayTime = data.readUInt16LE(119);
                    parsedData.rainRate.month = data.readUInt16LE(121);


                    // RAIN SUM in cups
                    parsedData.rainSum.month = data.readUInt16LE(123);
                    parsedData.rainSum.year = data.readUInt16LE(125);


                    // EXTRA/SOIL/LEAF TEMPERATURES in °F
                    for (let i = 2; i < 9; i++) parsedData.temps[i] = { day: {}, month: {}, year: {} };
                    parsedData.temps[0] = parsedData.tempIn;
                    parsedData.temps[1] = parsedData.tempOut;
                    for (let i = 0; i < 4; i++) parsedData.soilTemps[i] = { day: {}, month: {}, year: {} };
                    for (let i = 0; i < 4; i++) parsedData.leafTemps[i] = { day: {}, month: {}, year: {} };
                    // Daily low
                    this.parseExtraLeafSoilTempsProperty(data, parsedData, 127, 1, "day", "low");
                    // Daily low time
                    this.parseExtraLeafSoilTempsProperty(data, parsedData, 157, 2, "day", "lowTime");
                    // Daily high
                    this.parseExtraLeafSoilTempsProperty(data, parsedData, 142, 1, "day", "high");
                    // Daily high time
                    this.parseExtraLeafSoilTempsProperty(data, parsedData, 187, 2, "day", "highTime");
                    // Monthly high
                    this.parseExtraLeafSoilTempsProperty(data, parsedData, 217, 1, "month", "high");
                    // Monthly low
                    this.parseExtraLeafSoilTempsProperty(data, parsedData, 232, 1, "month", "low");
                    // Yearly high
                    this.parseExtraLeafSoilTempsProperty(data, parsedData, 247, 1, "year", "high");
                    // Yearly low
                    this.parseExtraLeafSoilTempsProperty(data, parsedData, 262, 1, "year", "low");


                    // OUTSIDE/EXTRA HUMIDITIES IN %
                    for (let i = 1; i < 9; i++) parsedData.hums[i] = { day: {}, month: {}, year: {} };
                    parsedData.hums[0] = parsedData.humIn;
                    // Daily low
                    this.parseOutsideExtraHumsProperty(data, parsedData, 277, 1, "day", "low");
                    // Daily low time
                    this.parseOutsideExtraHumsProperty(data, parsedData, 293, 2, "day", "lowTime");
                    // Daily high
                    this.parseOutsideExtraHumsProperty(data, parsedData, 285, 1, "day", "high");
                    // Daily high time
                    this.parseOutsideExtraHumsProperty(data, parsedData, 309, 2, "day", "highTime");
                    // Monthly low
                    this.parseOutsideExtraHumsProperty(data, parsedData, 325, 1, "month", "high");
                    // Monthly high
                    this.parseOutsideExtraHumsProperty(data, parsedData, 333, 1, "month", "low");
                    // Yearly low
                    this.parseOutsideExtraHumsProperty(data, parsedData, 341, 1, "year", "high");
                    // Yearly high
                    this.parseOutsideExtraHumsProperty(data, parsedData, 349, 1, "year", "low");
                    parsedData.humOut = parsedData.hums[1];


                    // SOIL MOISTURE in cb
                    for (let i = 0; i < 4; i++) parsedData.soilMoistures[i] = { day: {}, month: {}, year: {} };
                    // Daily low
                    this.parseSoilMoistureProperty(data, parsedData, 357, 1, "day", "high");
                    // Daily high
                    this.parseSoilMoistureProperty(data, parsedData, 361, 2, "day", "highTime");
                    // Daily low time
                    this.parseSoilMoistureProperty(data, parsedData, 369, 1, "day", "low");
                    // Daily high time
                    this.parseSoilMoistureProperty(data, parsedData, 373, 2, "day", "lowTime");
                    // Monthly low
                    this.parseSoilMoistureProperty(data, parsedData, 381, 1, "month", "low");
                    // Monthly high
                    this.parseSoilMoistureProperty(data, parsedData, 385, 1, "month", "high");
                    // Yearly low
                    this.parseSoilMoistureProperty(data, parsedData, 389, 1, "year", "high");
                    // Yearly high
                    this.parseSoilMoistureProperty(data, parsedData, 393, 1, "year", "low");


                    // LEAF WETNESS (0-15)
                    for (let i = 0; i < 4; i++) parsedData.leafWetnesses[i] = { day: {}, month: {}, year: {} };
                    // Daily low
                    this.parseLeafWetnessProperty(data, parsedData, 397, 1, "day", "high");
                    // Daily high
                    this.parseLeafWetnessProperty(data, parsedData, 401, 2, "day", "highTime");
                    // Daily low time
                    this.parseLeafWetnessProperty(data, parsedData, 409, 1, "day", "low");
                    // Daily high time
                    this.parseLeafWetnessProperty(data, parsedData, 413, 2, "day", "lowTime");
                    // Monthly low
                    this.parseLeafWetnessProperty(data, parsedData, 421, 1, "month", "low");
                    // Monthly high
                    this.parseLeafWetnessProperty(data, parsedData, 425, 1, "month", "high");
                    // Yearly low
                    this.parseLeafWetnessProperty(data, parsedData, 429, 1, "year", "high");
                    // Yearly high
                    this.parseLeafWetnessProperty(data, parsedData, 433, 1, "year", "low");

                    // CRC
                    parsedData.CRC = data.readUInt16LE(437);
                    resolve(parsedData);
                })
            })
        })
    }

    private parsePressure(data: Buffer, parsedData: any) {
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
    }

    private parseWind(data: Buffer, parsedData: any) {
        parsedData.wind.day = data.readUIntLE(17, 1);
        parsedData.wind.dayTime = data.readUInt16LE(18);
        parsedData.wind.month = data.readUIntLE(20, 1);
        parsedData.wind.year = data.readUIntLE(21, 1);
    }

    private parseInsideTemperature(data: Buffer, parsedData: any) {
        const dayLow = data.readInt16LE(24);
        parsedData.tempIn.day.low = dayLow === 32767 ? null : dayLow / 10;
        if (parsedData.tempIn.day.low !== null) parsedData.tempIn.day.lowTime = data.readInt16LE(28);
        else parsedData.tempIn.day.lowTime = null;

        const dayHigh = data.readInt16LE(22);
        parsedData.tempIn.day.high = dayHigh === -32768 ? null : dayHigh / 10;
        if (parsedData.tempIn.day.high !== null) parsedData.tempIn.day.highTime = data.readInt16LE(26);
        else parsedData.tempIn.day.highTime = null;

        const monthHigh = data.readInt16LE(30);
        parsedData.tempIn.month.high = monthHigh === -32768 ? null : monthHigh / 10;

        const monthLow = data.readInt16LE(32);
        parsedData.tempIn.month.low = monthLow === 32767 ? null : monthLow / 10;

        const yearHigh = data.readInt16LE(34);
        parsedData.tempIn.year.high = yearHigh === -32768 ? null : monthHigh / 10;

        const yearLow = data.readInt16LE(36);
        parsedData.tempIn.year.low = yearLow === 32767 ? null : yearLow / 10;
    }

    private parseInsideHumidity(data: Buffer, parsedData: any) {
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
    }

    private parseExtraLeafSoilTempsProperty(data: Buffer, parsedData: any, offset: number, byteCount: 2 | 1, fieldCategory: "day" | "month" | "year", fieldName: "low" | "high" | "lowTime" | "highTime") {
        for (let index = 0; index < 15; offset += byteCount, index++) {
            if (index <= 6) {
                const tempIndex = index + 2;
                if (byteCount === 1) parsedData.temps[tempIndex][fieldCategory][fieldName] = data.readInt8(offset);
                else parsedData.temps[tempIndex][fieldCategory][fieldName] = data.readInt16LE(offset);
                if (parsedData.temps[tempIndex][fieldCategory][fieldName] <= -1) parsedData.temps[tempIndex][fieldCategory][fieldName] = null;
            } else if (index <= 10) {
                const soilIndex = index - 7;
                if (byteCount === 1) parsedData.soilTemps[soilIndex][fieldCategory][fieldName] = data.readInt8(offset);
                else parsedData.soilTemps[soilIndex][fieldCategory][fieldName] = data.readInt16LE(offset);
                if (parsedData.soilTemps[soilIndex][fieldCategory][fieldName] <= -1) parsedData.soilTemps[soilIndex][fieldCategory][fieldName] = null;
            } else {
                const leafIndex = index - 11;
                if (byteCount === 1) parsedData.leafTemps[leafIndex][fieldCategory][fieldName] = data.readInt8(offset);
                else parsedData.leafTemps[leafIndex][fieldCategory][fieldName] = data.readInt16LE(offset);
                if (parsedData.leafTemps[leafIndex][fieldCategory][fieldName] <= -1) parsedData.leafTemps[leafIndex][fieldCategory][fieldName] = null;
            }
        }
    }

    private parseOutsideExtraHumsProperty(data: Buffer, parsedData: any, offset: number, byteCount: 2 | 1, fieldCategory: "day" | "month" | "year", fieldName: "low" | "high" | "lowTime" | "highTime") {
        for (let index = 1; index < 9; offset += byteCount, index++) {
            if (byteCount === 1) parsedData.hums[index][fieldCategory][fieldName] = data.readUInt8(offset);
            else parsedData.hums[index][fieldCategory][fieldName] = data.readUInt16LE(offset);

            // Parse dash values to null
            let shouldBeNull: boolean;
            if (fieldName === "highTime" || fieldName === "lowTime") {
                shouldBeNull = parsedData.hums[index][fieldCategory][fieldName] === 65535 || parsedData.hums[index][fieldCategory][fieldName.replace("Time", "")] === null;
            } else {
                shouldBeNull = parsedData.hums[index][fieldCategory][fieldName] === 255;
            }
            if (shouldBeNull) parsedData.hums[index][fieldCategory][fieldName] = null;
        }
    }

    private parseSoilMoistureProperty(data: Buffer, parsedData: any, offset: number, byteCount: 2 | 1, fieldCategory: "day" | "month" | "year", fieldName: "low" | "high" | "lowTime" | "highTime") {
        for (let index = 0; index < 4; offset += byteCount, index++) {
            if (byteCount === 1) parsedData.soilMoistures[index][fieldCategory][fieldName] = data.readUInt8(offset);
            else parsedData.soilMoistures[index][fieldCategory][fieldName] = data.readUInt16LE(offset);

            // Parse dash values to null
            let shouldBeNull: boolean;
            if (fieldName === "highTime" || fieldName === "lowTime") {
                shouldBeNull = parsedData.soilMoistures[index][fieldCategory][fieldName] === 65535 || parsedData.soilMoistures[index][fieldCategory][fieldName.replace("Time", "")] === null;
            } else {
                shouldBeNull = parsedData.soilMoistures[index][fieldCategory][fieldName] === 255;
            }
            if (shouldBeNull) parsedData.soilMoistures[index][fieldCategory][fieldName] = null;
        }
    }

    private parseLeafWetnessProperty(data: Buffer, parsedData: any, offset: number, byteCount: 2 | 1, fieldCategory: "day" | "month" | "year", fieldName: "low" | "high" | "lowTime" | "highTime") {
        for (let index = 0; index < 4; offset += byteCount, index++) {
            if (byteCount === 1) parsedData.leafWetnesses[index][fieldCategory][fieldName] = data.readUInt8(offset);
            else parsedData.leafWetnesses[index][fieldCategory][fieldName] = data.readUInt16LE(offset);
            // Parse dash values to null
            let shouldBeNull: boolean;
            if (fieldName === "highTime" || fieldName === "lowTime") {
                shouldBeNull = parsedData.leafWetnesses[index][fieldCategory][fieldName] === 65535 || parsedData.leafWetnesses[index][fieldCategory][fieldName.replace("Time", "")] === null;
            } else {
                shouldBeNull = parsedData.leafWetnesses[index][fieldCategory][fieldName] === 255;
            }
            if (shouldBeNull) parsedData.leafWetnesses[index][fieldCategory][fieldName] = null;
        }
    }

}