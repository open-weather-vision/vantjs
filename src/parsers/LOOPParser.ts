import BinaryParser, { ArrayType, Type } from "../util/BinaryParser";
import { LOOP1, LoopPackageType } from "../structures/LOOP";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import {
    RainCollectorSize,
    createRainClicksToInchTransformer,
} from "./RainCollector";
import { UnitSettings } from "../interfaces/VantInterface";

/**
 * Parser for a LOOP binary data package (without the acknowledgement byte and the crc bytes).
 */
export default class LOOPParser extends BinaryParser<LOOP1> {
    constructor(rainCollectorSize: RainCollectorSize, units: UnitSettings) {
        const rainClicksToInchTransformer =
            createRainClicksToInchTransformer(rainCollectorSize);
        super(
            {
                pressure: {
                    current: {
                        type: Type.UINT16,
                        position: 7,
                        transform: "pressure",
                        nullables: "pressure",
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
                                    default:
                                        return null;
                                }
                            },
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
                                    default:
                                        return null;
                                }
                            },
                        },
                    },
                },
                temperature: {
                    in: {
                        type: Type.INT16,
                        position: 9,
                        nullables: "temperature",
                        transform: "temperature",
                    },
                    out: {
                        type: Type.INT16,
                        position: 12,
                        nullables: "temperature",
                        transform: "temperature",
                    },
                    extra: [
                        {
                            type: Type.UINT8,
                            position: 18,
                            nullables: "extraTemp",
                        },
                        7,
                        ArrayType.PROPERTY_BASED,
                    ],
                },
                leafTemps: [
                    {
                        type: Type.UINT8,
                        position: 29,
                        nullables: "leafTemp",
                    },
                    4,
                    ArrayType.PROPERTY_BASED,
                ],
                soilTemps: [
                    {
                        type: Type.UINT8,
                        position: 25,
                        nullables: "soilTemp",
                    },
                    4,
                    ArrayType.PROPERTY_BASED,
                ],
                humidity: {
                    in: {
                        type: Type.UINT8,
                        position: 11,
                        nullables: "humidity",
                    },
                    out: {
                        type: Type.UINT8,
                        position: 33,
                        nullables: "humidity",
                    },
                    extra: [
                        {
                            type: Type.UINT8,
                            position: 34,
                            nullables: "humidity",
                        },
                        7,
                        ArrayType.PROPERTY_BASED,
                    ],
                },
                wind: {
                    current: { type: Type.UINT8, position: 14 },
                    avg: { type: Type.UINT8, position: 15 },
                    direction: {
                        type: Type.UINT16,
                        position: 16,
                        nullables: [0],
                    },
                },
                rain: {
                    rate: {
                        type: Type.UINT16,
                        position: 41,
                        transform: rainClicksToInchTransformer,
                    },
                    storm: {
                        type: Type.UINT16,
                        position: 46,
                        transform: rainClicksToInchTransformer,
                    },
                    stormStartDate: {
                        type: Type.INT16,
                        position: 48,
                        nullables: [-1, 0xffff],
                        transform: "stormStartDate",
                    },
                    day: {
                        type: Type.UINT16,
                        position: 50,
                        transform: rainClicksToInchTransformer,
                    },
                    month: {
                        type: Type.UINT16,
                        position: 52,
                        transform: rainClicksToInchTransformer,
                    },
                    year: {
                        type: Type.UINT16,
                        position: 54,
                        transform: rainClicksToInchTransformer,
                    },
                },
                et: {
                    day: {
                        type: Type.UINT16,
                        position: 56,
                        nullables: [65535],
                        transform: (val) => val * 1000,
                    },
                    month: {
                        type: Type.UINT16,
                        position: 58,
                        nullables: [65535],
                        transform: (val) => val * 100,
                    },
                    year: {
                        type: Type.UINT16,
                        position: 60,
                        nullables: [255],
                        transform: (val) => val * 100,
                    },
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
                uv: { type: Type.UINT8, position: 43, nullables: "uv" },
                solarRadiation: {
                    type: Type.UINT16,
                    position: 44,
                    nullables: "solar",
                },
                nextArchiveRecord: { type: Type.UINT16, position: 5 },
                alarms: {
                    pressure: {
                        falling: {
                            type: Type.BIT,
                            position: 70,
                            transform: "alarm",
                        },
                        rising: {
                            type: Type.BIT,
                            position: 70 + 1 / 8,
                            transform: "alarm",
                        },
                    },
                    tempIn: {
                        low: {
                            type: Type.BIT,
                            position: 70 + 2 / 8,
                            transform: "alarm",
                        },
                        high: {
                            type: Type.BIT,
                            position: 70 + 3 / 8,
                            transform: "alarm",
                        },
                    },
                    humIn: {
                        low: {
                            type: Type.BIT,
                            position: 70 + 4 / 8,
                            transform: "alarm",
                        },
                        high: {
                            type: Type.BIT,
                            position: 70 + 5 / 8,
                            transform: "alarm",
                        },
                    },
                    time: {
                        type: Type.BIT,
                        position: 70 + 6 / 8,
                        transform: "alarm",
                    },
                    rain: {
                        rate: {
                            type: Type.BIT,
                            position: 71,
                            transform: "alarm",
                        },
                        quarter: {
                            type: Type.BIT,
                            position: 71 + 1 / 8,
                            transform: "alarm",
                        },
                        daily: {
                            type: Type.BIT,
                            position: 71 + 2 / 8,
                            transform: "alarm",
                        },
                        stormTotal: {
                            type: Type.BIT,
                            position: 71 + 3 / 8,
                            transform: "alarm",
                        },
                    },
                    dailyET: {
                        type: Type.BIT,
                        position: 71 + 4 / 8,
                        transform: "alarm",
                    },
                    tempOut: {
                        low: {
                            type: Type.BIT,
                            position: 72,
                            transform: "alarm",
                        },
                        high: {
                            type: Type.BIT,
                            position: 72 + 1 / 8,
                            transform: "alarm",
                        },
                    },
                    wind: {
                        speed: {
                            type: Type.BIT,
                            position: 72 + 2 / 8,
                            transform: "alarm",
                        },
                        avg: {
                            type: Type.BIT,
                            position: 72 + 3 / 8,
                            transform: "alarm",
                        },
                    },
                    dewpoint: {
                        low: {
                            type: Type.BIT,
                            position: 72 + 4 / 8,
                            transform: "alarm",
                        },
                        high: {
                            type: Type.BIT,
                            position: 72 + 5 / 8,
                            transform: "alarm",
                        },
                    },
                    heat: {
                        type: Type.BIT,
                        position: 72 + 6 / 8,
                        transform: "alarm",
                    },
                    chill: {
                        type: Type.BIT,
                        position: 72 + 7 / 8,
                        transform: "alarm",
                    },
                    THSW: { type: Type.BIT, position: 73, transform: "alarm" },
                    solarRadiation: {
                        type: Type.BIT,
                        position: 73 + 1 / 8,
                        transform: "alarm",
                    },
                    UV: {
                        dose: {
                            type: Type.BIT,
                            position: 73 + 3 / 8,
                            transform: "alarm",
                        },
                        enabledAndCleared: {
                            type: Type.BIT,
                            position: 73 + 4 / 8,
                            transform: "alarm",
                        },
                        high: {
                            type: Type.BIT,
                            position: 73 + 2 / 8,
                            transform: "alarm",
                        },
                    },
                    humOut: {
                        low: {
                            type: Type.BIT,
                            position: 74 + 2 / 8,
                            transform: "alarm",
                        },
                        high: {
                            type: Type.BIT,
                            position: 74 + 3 / 8,
                            transform: "alarm",
                        },
                    },
                    extraTemps: [
                        {
                            low: {
                                type: Type.BIT,
                                position: 75,
                                transform: "alarm",
                            },
                            high: {
                                type: Type.BIT,
                                position: 75 + 1 / 8,
                                transform: "alarm",
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
                                transform: "alarm",
                            },
                            high: {
                                type: Type.BIT,
                                position: 75 + 3 / 8,
                                transform: "alarm",
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
                                transform: "alarm",
                            },
                            high: {
                                type: Type.BIT,
                                position: 82 + 1 / 8,
                                transform: "alarm",
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
                                transform: "alarm",
                            },
                            high: {
                                type: Type.BIT,
                                position: 82 + 3 / 8,
                                transform: "alarm",
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
                                transform: "alarm",
                            },
                            high: {
                                type: Type.BIT,
                                position: 82 + 5 / 8,
                                transform: "alarm",
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
                                transform: "alarm",
                            },
                            high: {
                                type: Type.BIT,
                                position: 82 + 7 / 8,
                                transform: "alarm",
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
                    transform: (val) => (val * 300) / 512 / 100,
                },
                forecast: {
                    iconNumber: {
                        type: Type.INT8,
                        position: 89,
                        transform: (val) => {
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
                    },
                    iconText: {
                        copyof: "iconNumber",
                        transform: (val) => {
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
                    },
                    rule: {
                        type: Type.UINT8,
                        position: 90,
                        dependsOn: "iconNumber",
                    },
                },
                sunrise: {
                    type: Type.UINT16,
                    position: 91,
                    nullables: "time",
                    transform: "time",
                },
                sunset: {
                    type: Type.UINT16,
                    position: 93,
                    nullables: "time",
                    transform: "time",
                },
            },
            nullables,
            transformers
        );
    }

    public parse(buffer: Buffer) {
        const result = super.parse(buffer) as Partial<LOOP1>;
        result.packageType = LoopPackageType.LOOP;
        return result as LOOP1;
    }
}
