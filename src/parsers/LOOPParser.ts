import BinaryParser, { ArrayType, Type } from "../util/BinaryParser";

export default class LOOPParser extends BinaryParser {
    constructor() {
        super({
            pressure: {
                current: {
                    type: Type.UINT16, position: 7, transform: "pressure", nullables: "pressure",
                },
                trend: {
                    value: {
                        type: Type.INT8,
                        position: 3,
                        transform: (value) => {
                            switch (value) {
                                case -60:
                                case -20:
                                case 0:
                                case 20:
                                case 60:
                                    return value;
                                default: return null;
                            }
                        }
                    },
                    text: {
                        copyof: "value",
                        transform: (value) => {
                            switch (value) {
                                case -60:
                                    return "Falling Rapidly";
                                case -20:
                                    return "Falling Slowly";
                                case 0:
                                    return "Steady";
                                case 20:
                                    return "Rising Slowly";
                                case 60:
                                    return "Rising Rapidly";
                                default: return null;
                            }
                        }
                    }
                },
            },
            temperature: {
                in: { type: Type.INT16, position: 9, nullables: "temperature", transform: "temperature" },
                out: { type: Type.INT16, position: 12, nullables: "temperature", transform: "temperature" },
                extra: [{
                    type: Type.UINT8,
                    position: 18,
                    nullables: "extraTemp",
                }, 7, ArrayType.PROPERTY_BASED],
            },
            leafTemps: [{
                type: Type.UINT8,
                position: 29,
                nullables: "leafTemp",
            }, 4, ArrayType.PROPERTY_BASED],
            soilTemps: [{
                type: Type.UINT8,
                position: 25,
                nullables: "soilTemp",
            }, 4, ArrayType.PROPERTY_BASED],
            humidity: {
                in: { type: Type.UINT8, position: 11, nullables: "humidity" },
                out: { type: Type.UINT8, position: 33, nullables: "humidity" },
                extra: [{
                    type: Type.UINT8,
                    position: 34,
                    nullables: "humidity",
                }, 7, ArrayType.PROPERTY_BASED],
            },
            wind: {
                current: { type: Type.UINT8, position: 14 },
                avg: { type: Type.UINT8, position: 15 },
                direction: { type: Type.UINT16, position: 16, nullables: [0] },
            },
            rain: {
                rate: { type: Type.UINT16, position: 41 },
                storm: { type: Type.UINT16, position: 46, transform: (val) => val * 100 },
                // TODO
                stormStartDate: {},
                day: { type: Type.UINT16, position: 50 },
                month: { type: Type.UINT16, position: 52 },
                year: { type: Type.UINT16, position: 54 },
            },
            et: {
                day: { type: Type.UINT16, position: 56, nullables: [65535], transform: (val) => val * 1000 },
                month: { type: Type.UINT16, position: 58, nullables: [65535], transform: (val) => val * 100 },
                year: { type: Type.UINT16, position: 60, nullables: [255], transform: (val) => val * 100 },
            },
            soilMoistures: [{ type: Type.UINT8, position: 62, nullables: [255] }, 4, ArrayType.PROPERTY_BASED],
            leafWetnesses: [{ type: Type.UINT8, position: 66, nullables: [255] }, 4, ArrayType.PROPERTY_BASED],
            uv: { type: Type.UINT8, position: 43, nullables: "uv" },
            solarRadiation: { type: Type.UINT16, position: 44, nullables: "solar" },
            nextArchiveRecord: { type: Type.UINT16, position: 5, transform: (val) => `0x${val.toString(16)}` },
            alarms: {
                pressure: {
                    falling: { type: Type.BIT, position: 70, transform: "alarm" },
                    rising: { type: Type.BIT, position: 70 + 1 / 8, transform: "alarm" },
                },
                tempIn: {
                    low: { type: Type.BIT, position: 70 + 2 / 8, transform: "alarm" },
                    high: { type: Type.BIT, position: 70 + 3 / 8, transform: "alarm" },
                },
                humIn: {
                    low: { type: Type.BIT, position: 70 + 4 / 8, transform: "alarm" },
                    high: { type: Type.BIT, position: 70 + 5 / 8, transform: "alarm" },
                },
                time: { type: Type.BIT, position: 70 + 6 / 8, transform: "alarm" },
                rain: {
                    rate: { type: Type.BIT, position: 71, transform: "alarm" },
                    quarter: { type: Type.BIT, position: 71 + 1 / 8, transform: "alarm" },
                    daily: { type: Type.BIT, position: 71 + 2 / 8, transform: "alarm" },
                    stormTotal: { type: Type.BIT, position: 71 + 3 / 8, transform: "alarm" },
                },
                dailyET: { type: Type.BIT, position: 71 + 4 / 8, transform: "alarm" },
                tempOut: {
                    low: { type: Type.BIT, position: 72, transform: "alarm" },
                    high: { type: Type.BIT, position: 72 + 1 / 8, transform: "alarm" },
                },
                wind: {
                    speed: { type: Type.BIT, position: 72 + 2 / 8, transform: "alarm" },
                    avg: { type: Type.BIT, position: 72 + 3 / 8, transform: "alarm" },
                },
                dewpoint: {
                    low: { type: Type.BIT, position: 72 + 4 / 8, transform: "alarm" },
                    high: { type: Type.BIT, position: 72 + 5 / 8, transform: "alarm" },
                },
                heat: { type: Type.BIT, position: 72 + 6 / 8, transform: "alarm" },
                chill: { type: Type.BIT, position: 72 + 7 / 8, transform: "alarm" },
                THSW: { type: Type.BIT, position: 73, transform: "alarm" },
                solarRadiation: { type: Type.BIT, position: 73 + 1 / 8, transform: "alarm" },
                UV: {
                    dose: { type: Type.BIT, position: 73 + 3 / 8, transform: "alarm" },
                    enabledAndCleared: { type: Type.BIT, position: 73 + 4 / 8, transform: "alarm" },
                    high: { type: Type.BIT, position: 73 + 2 / 8, transform: "alarm" },
                },
                humOut: {
                    low: { type: Type.BIT, position: 74 + 2 / 8, transform: "alarm" },
                    high: { type: Type.BIT, position: 74 + 3 / 8, transform: "alarm" },
                },
                extraTemps: [{
                    low: { type: Type.BIT, position: 75, transform: "alarm" },
                    high: { type: Type.BIT, position: 75 + 1 / 8, transform: "alarm" },
                }, 7, ArrayType.ENTRY_BASED, 1],
                extraHums: [{
                    low: { type: Type.BIT, position: 75 + 2 / 8, transform: "alarm" },
                    high: { type: Type.BIT, position: 75 + 3 / 8, transform: "alarm" },
                }, 7, ArrayType.ENTRY_BASED, 1],
                leafWetnesses: [{
                    low: { type: Type.BIT, position: 82, transform: "alarm" },
                    high: { type: Type.BIT, position: 82 + 1 / 8, transform: "alarm" },
                }, 4, ArrayType.ENTRY_BASED, 1],
                soilMoistures: [{
                    low: { type: Type.BIT, position: 82 + 2 / 8, transform: "alarm" },
                    high: { type: Type.BIT, position: 82 + 3 / 8, transform: "alarm" },
                }, 4, ArrayType.ENTRY_BASED, 1],
                leafTemps: [{
                    low: { type: Type.BIT, position: 82 + 4 / 8, transform: "alarm" },
                    high: { type: Type.BIT, position: 82 + 5 / 8, transform: "alarm" },
                }, 4, ArrayType.ENTRY_BASED, 1],
                soilTemps: [{
                    low: { type: Type.BIT, position: 82 + 6 / 8, transform: "alarm" },
                    high: { type: Type.BIT, position: 82 + 7 / 8, transform: "alarm" },
                }, 4, ArrayType.ENTRY_BASED, 1],
                transmitterBatteryStatus: { type: Type.UINT8, position: 86 },
                consoleBatteryVoltage: { type: Type.UINT16, position: 87, transform: (val) => ((val * 300) / 512) / 100 },
                forecast: {
                    iconNumber: { type: Type.INT8, position: 89 },
                    iconText: {
                        copyof: "iconNumber", transform: (val) => {
                            switch (val) {
                                case 8: return "Mostly Clear";
                                case 6: return "Partly Cloudy";
                                case 2: return "Mostly Cloudy";
                                case 3: return "Mostly Cloudy, Rain within 12 hours";
                                case 18: return "Mostly Cloudy, Snow within 12 hours";
                                case 19: return "Mostly Cloudy, Rain or Snow within 12 hours";
                                case 7: return "Partly Cloudy, Rain within 12 hours";
                                case 22: return "Partly Cloudy, Snow within 12 hours";
                                case 23: return "Partly Cloudy, Rain or Snow within 12 hours";
                                default: return null;
                            }
                        }
                    },
                    rule: { type: Type.UINT8, position: 90 },
                },
                sunrise: { type: Type.UINT16, position: 91, nullables: "time", transform: "time" },
                sunset: { type: Type.UINT16, position: 93, nullables: "time", transform: "time" },
            }
        });
        this.setTransformer("alarm", (val) => val === 1)
        this.setTransformer("pressure", (val) => {
            if (val < 20_000 || val > 32_500)
                return null;
            else return val / 1000;
        });
        this.setTransformer("temperature", (value) => value / 10);
        this.setTransformer("time", (value) => {
            const stringValue = value.toString();
            switch (stringValue.length) {
                case 1: return `00:0${stringValue}`;
                case 2: return `00:${stringValue}`;
                case 3: return `0${stringValue.charAt(0)}:${stringValue.substring(1)}`;
                case 4: return `${stringValue.substring(0, 2)}:${stringValue.substring(2)}`;
            }
            return value;
        });
        this.setTransformer("uv", (value) => value / 10);
        this.setTransformer("extraTemp", (value) => value - 90);
        this.setTransformer("soilTemp", (value) => value - 90);
        this.setTransformer("leafTemp", (value) => value - 90);
        this.setNullables("uv", [255]);
        this.setNullables("pressure", [0]);
        this.setNullables("humidity", [0, 255]);
        this.setNullables("time", [65535]);
        this.setNullables("temperature", [32767]);
        this.setNullables("heat", [-32768]);
        this.setNullables("thsw", [-32768]);
        this.setNullables("chill", [32768]);
        this.setNullables("solar", [32767, 32768]);
        this.setNullables("extraTemp", [255]);
        this.setNullables("soilTemp", [255]);
        this.setNullables("leafTemp", [255]);
        this.setNullables("leafWetness", [255]);
        this.setNullables("soilMoisture", [255]);
    }

    public parse(buffer: Buffer): any {
        const result = super.parse(buffer);
        result.packageType = "LOOP";
        // result.alarms.extraTemps = [result.alarms.extraTemp1, result.alarms.extraTemp2, result.alarms.extraTemp3, result.alarms.extraTemp4, result.alarms.extraTemp5, result.alarms.extraTemp6, result.alarms.extraTemp7];
        // result.alarms.extraHums = [result.alarms.extraHum1, result.alarms.extraHum2, result.alarms.extraHum3, result.alarms.extraHum4, result.alarms.extraHum5, result.alarms.extraHum6, result.alarms.extraHum7];
        // for (let i = 1; i <= 7; i++) delete result.alarms[`extraTemp${i}`];
        // for (let i = 1; i <= 7; i++) delete result.alarms[`extraHum${i}`];
        return result as any;
    }
}