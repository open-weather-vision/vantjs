import BinaryParser, { ArrayType, Type } from "../util/BinaryParser";
import { LOOPPackageType } from "../structures/LOOPPackageType";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/unitTransformers";
import LOOP1 from "../structures/LOOP1";
import merge from "lodash.merge";

/**
 * Parser for a LOOP binary data package (without the acknowledgement byte and the crc bytes).
 */
export default class LOOP1Parser extends BinaryParser<LOOP1> {
    constructor(
        rainClicksToInchTransformer: (rainClicks: number) => number,
        unitTransformers: UnitTransformers
    ) {
        super({
            press: {
                type: Type.UINT16,
                position: 7,
                transform: [transformers.pressure, unitTransformers.pressure],
                nullables: nullables.pressure,
            },
            pressTrendID: {
                type: Type.INT8,
                position: 3,
                transform: [
                    (value) => {
                        switch (value) {
                            case -60:
                            case -20:
                            case 0:
                            case 20:
                            case 60:
                                return value;
                            default:
                                return null;
                        }
                    },
                ],
            },
            pressTrend: {
                copyof: "pressTrendID",
                transform: [
                    (value) => {
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
                            default:
                                return null;
                        }
                    },
                ],
            },
            tempIn: {
                type: Type.INT16,
                position: 9,
                nullables: nullables.temperature,
                transform: [
                    transformers.temperature,
                    unitTransformers.temperature,
                ],
            },
            tempOut: {
                type: Type.INT16,
                position: 12,
                nullables: nullables.temperature,
                transform: [
                    transformers.temperature,
                    unitTransformers.temperature,
                ],
            },
            tempExtra: [
                {
                    type: Type.UINT8,
                    position: 18,
                    nullables: nullables.extraTemp,
                    transform: [
                        transformers.extraTemp,
                        unitTransformers.temperature,
                    ],
                },
                7,
                ArrayType.PROPERTY_BASED,
            ],
            leafTemps: [
                {
                    type: Type.UINT8,
                    position: 29,
                    nullables: nullables.leafTemp,
                    transform: [
                        transformers.leafTemp,
                        unitTransformers.temperature,
                    ],
                },
                4,
                ArrayType.PROPERTY_BASED,
            ],
            soilTemps: [
                {
                    type: Type.UINT8,
                    position: 25,
                    nullables: nullables.soilTemp,
                    transform: [
                        transformers.soilTemp,
                        unitTransformers.temperature,
                    ],
                },
                4,
                ArrayType.PROPERTY_BASED,
            ],
            humIn: {
                type: Type.UINT8,
                position: 11,
                nullables: nullables.humidity,
            },
            humOut: {
                type: Type.UINT8,
                position: 33,
                nullables: nullables.humidity,
            },
            humExtra: [
                {
                    type: Type.UINT8,
                    position: 34,
                    nullables: nullables.humidity,
                },
                7,
                ArrayType.PROPERTY_BASED,
            ],
            wind: {
                type: Type.UINT8,
                position: 14,
                transform: [unitTransformers.wind],
            },
            windAvg10m: {
                type: Type.UINT8,
                position: 15,
                transform: [unitTransformers.wind],
            },
            windDirDeg: {
                type: Type.UINT16,
                position: 16,
            },
            windDir: {
                copyof: "windDirDeg",
                transform: [transformers.windDir],
            },
            rainRate: {
                type: Type.UINT16,
                position: 41,
                transform: [rainClicksToInchTransformer, unitTransformers.rain],
            },
            rainDay: {
                type: Type.UINT16,
                position: 50,
                transform: [rainClicksToInchTransformer, unitTransformers.rain],
            },
            rainMonth: {
                type: Type.UINT16,
                position: 52,
                transform: [rainClicksToInchTransformer, unitTransformers.rain],
            },
            rainYear: {
                type: Type.UINT16,
                position: 54,
                transform: [rainClicksToInchTransformer, unitTransformers.rain],
            },
            stormRain: {
                type: Type.UINT16,
                position: 46,
                transform: [rainClicksToInchTransformer, unitTransformers.rain],
                dependsOn: "stormStartDate",
            },
            stormStartDate: {
                type: Type.INT16,
                position: 48,
                nullables: [-1, 0xffff],
                transform: [transformers.stormStartDate],
            },
            etDay: {
                type: Type.UINT16,
                position: 56,
                nullables: [65535],
                transform: [transformers.dayET, unitTransformers.rain],
            },
            etMonth: {
                type: Type.UINT16,
                position: 58,
                nullables: [65535],
                transform: [transformers.monthET, unitTransformers.rain],
            },
            etYear: {
                type: Type.UINT16,
                position: 60,
                nullables: [255],
                transform: [transformers.yearET, unitTransformers.rain],
            },
            soilMoistures: [
                { type: Type.UINT8, position: 62, nullables: [255] },
                4,
                ArrayType.PROPERTY_BASED,
            ],
            leafWetnesses: [
                { type: Type.UINT8, position: 66, nullables: [255] },
                4,
                ArrayType.PROPERTY_BASED,
            ],
            uv: { type: Type.UINT8, position: 43, nullables: nullables.uv },
            solarRadiation: {
                type: Type.UINT16,
                position: 44,
                nullables: nullables.solar,
                transform: [unitTransformers.solarRadiation],
            },
            nextArchiveRecord: { type: Type.UINT16, position: 5 },
            alarms: {
                pressure: {
                    falling: {
                        type: Type.BIT,
                        position: 70,
                        transform: [transformers.alarm],
                    },
                    rising: {
                        type: Type.BIT,
                        position: 70 + 1 / 8,
                        transform: [transformers.alarm],
                    },
                },
                tempIn: {
                    low: {
                        type: Type.BIT,
                        position: 70 + 2 / 8,
                        transform: [transformers.alarm],
                    },
                    high: {
                        type: Type.BIT,
                        position: 70 + 3 / 8,
                        transform: [transformers.alarm],
                    },
                },
                humIn: {
                    low: {
                        type: Type.BIT,
                        position: 70 + 4 / 8,
                        transform: [transformers.alarm],
                    },
                    high: {
                        type: Type.BIT,
                        position: 70 + 5 / 8,
                        transform: [transformers.alarm],
                    },
                },
                time: {
                    type: Type.BIT,
                    position: 70 + 6 / 8,
                    transform: [transformers.alarm],
                },
                rain: {
                    rate: {
                        type: Type.BIT,
                        position: 71,
                        transform: [transformers.alarm],
                    },
                    quarter: {
                        type: Type.BIT,
                        position: 71 + 1 / 8,
                        transform: [transformers.alarm],
                    },
                    daily: {
                        type: Type.BIT,
                        position: 71 + 2 / 8,
                        transform: [transformers.alarm],
                    },
                    stormTotal: {
                        type: Type.BIT,
                        position: 71 + 3 / 8,
                        transform: [transformers.alarm],
                    },
                },
                dailyET: {
                    type: Type.BIT,
                    position: 71 + 4 / 8,
                    transform: [transformers.alarm],
                },
                tempOut: {
                    low: {
                        type: Type.BIT,
                        position: 72,
                        transform: [transformers.alarm],
                    },
                    high: {
                        type: Type.BIT,
                        position: 72 + 1 / 8,
                        transform: [transformers.alarm],
                    },
                },
                wind: {
                    speed: {
                        type: Type.BIT,
                        position: 72 + 2 / 8,
                        transform: [transformers.alarm],
                    },
                    avg: {
                        type: Type.BIT,
                        position: 72 + 3 / 8,
                        transform: [transformers.alarm],
                    },
                },
                dewpoint: {
                    low: {
                        type: Type.BIT,
                        position: 72 + 4 / 8,
                        transform: [transformers.alarm],
                    },
                    high: {
                        type: Type.BIT,
                        position: 72 + 5 / 8,
                        transform: [transformers.alarm],
                    },
                },
                heat: {
                    type: Type.BIT,
                    position: 72 + 6 / 8,
                    transform: [transformers.alarm],
                },
                chill: {
                    type: Type.BIT,
                    position: 72 + 7 / 8,
                    transform: [transformers.alarm],
                },
                thsw: {
                    type: Type.BIT,
                    position: 73,
                    transform: [transformers.alarm],
                },
                solarRadiation: {
                    type: Type.BIT,
                    position: 73 + 1 / 8,
                    transform: [transformers.alarm],
                },
                UV: {
                    dose: {
                        type: Type.BIT,
                        position: 73 + 3 / 8,
                        transform: [transformers.alarm],
                    },
                    enabledAndCleared: {
                        type: Type.BIT,
                        position: 73 + 4 / 8,
                        transform: [transformers.alarm],
                    },
                    high: {
                        type: Type.BIT,
                        position: 73 + 2 / 8,
                        transform: [transformers.alarm],
                    },
                },
                humOut: {
                    low: {
                        type: Type.BIT,
                        position: 74 + 2 / 8,
                        transform: [transformers.alarm],
                    },
                    high: {
                        type: Type.BIT,
                        position: 74 + 3 / 8,
                        transform: [transformers.alarm],
                    },
                },
                extraTemps: [
                    {
                        low: {
                            type: Type.BIT,
                            position: 75,
                            transform: [transformers.alarm],
                        },
                        high: {
                            type: Type.BIT,
                            position: 75 + 1 / 8,
                            transform: [transformers.alarm],
                        },
                    },
                    7,
                    ArrayType.ENTRY_BASED,
                    1,
                ],
                extraHums: [
                    {
                        low: {
                            type: Type.BIT,
                            position: 75 + 2 / 8,
                            transform: [transformers.alarm],
                        },
                        high: {
                            type: Type.BIT,
                            position: 75 + 3 / 8,
                            transform: [transformers.alarm],
                        },
                    },
                    7,
                    ArrayType.ENTRY_BASED,
                    1,
                ],
                leafWetnesses: [
                    {
                        low: {
                            type: Type.BIT,
                            position: 82,
                            transform: [transformers.alarm],
                        },
                        high: {
                            type: Type.BIT,
                            position: 82 + 1 / 8,
                            transform: [transformers.alarm],
                        },
                    },
                    4,
                    ArrayType.ENTRY_BASED,
                    1,
                ],
                soilMoistures: [
                    {
                        low: {
                            type: Type.BIT,
                            position: 82 + 2 / 8,
                            transform: [transformers.alarm],
                        },
                        high: {
                            type: Type.BIT,
                            position: 82 + 3 / 8,
                            transform: [transformers.alarm],
                        },
                    },
                    4,
                    ArrayType.ENTRY_BASED,
                    1,
                ],
                leafTemps: [
                    {
                        low: {
                            type: Type.BIT,
                            position: 82 + 4 / 8,
                            transform: [transformers.alarm],
                        },
                        high: {
                            type: Type.BIT,
                            position: 82 + 5 / 8,
                            transform: [transformers.alarm],
                        },
                    },
                    4,
                    ArrayType.ENTRY_BASED,
                    1,
                ],
                soilTemps: [
                    {
                        low: {
                            type: Type.BIT,
                            position: 82 + 6 / 8,
                            transform: [transformers.alarm],
                        },
                        high: {
                            type: Type.BIT,
                            position: 82 + 7 / 8,
                            transform: [transformers.alarm],
                        },
                    },
                    4,
                    ArrayType.ENTRY_BASED,
                    1,
                ],
            },
            transmitterBatteryStatus: { type: Type.UINT8, position: 86 },
            consoleBatteryVoltage: {
                type: Type.UINT16,
                position: 87,
                transform: [(val) => (val * 300) / 512 / 100],
            },
            forecastID: {
                type: Type.INT8,
                position: 89,
                transform: [
                    (val) => {
                        switch (val) {
                            case 8:
                            case 6:
                            case 2:
                            case 3:
                            case 18:
                            case 19:
                            case 7:
                            case 22:
                            case 23:
                                return val;
                            default:
                                return null;
                        }
                    },
                ],
            },
            forecast: {
                copyof: "forecastID",
                transform: [
                    (val) => {
                        switch (val) {
                            case 8:
                                return "Mostly Clear";
                            case 6:
                                return "Partly Cloudy";
                            case 2:
                                return "Mostly Cloudy";
                            case 3:
                                return "Mostly Cloudy, Rain within 12 hours";
                            case 18:
                                return "Mostly Cloudy, Snow within 12 hours";
                            case 19:
                                return "Mostly Cloudy, Rain or Snow within 12 hours";
                            case 7:
                                return "Partly Cloudy, Rain within 12 hours";
                            case 22:
                                return "Partly Cloudy, Snow within 12 hours";
                            case 23:
                                return "Partly Cloudy, Rain or Snow within 12 hours";
                            default:
                                return null;
                        }
                    },
                ],
            },
            forecastRule: {
                type: Type.UINT8,
                position: 90,
                dependsOn: "forecastID",
            },
            sunrise: {
                type: Type.UINT16,
                position: 91,
                nullables: nullables.time,
                transform: [transformers.time],
            },
            sunset: {
                type: Type.UINT16,
                position: 93,
                nullables: nullables.time,
                transform: [transformers.time],
            },
        });
    }

    public parse(buffer: Buffer) {
        const result = super.parse(buffer) as Omit<LOOP1, "packageType"> &
            Partial<LOOP1>;
        result.packageType = LOOPPackageType.LOOP1;
        return merge(new LOOP1(), result) as LOOP1;
    }
}
