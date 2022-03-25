import BinaryParser, { ArrayType, Type } from "../util/BinaryParser";
import HighsAndLows from "../structures/HighsAndLows";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/unitTransformers";
import merge from "lodash.merge";
import inspect from "../util/inspect";

/**
 * Parser for a highs and lows binary data package (without the acknowledgement byte and the crc bytes).
 */
export default class HighsAndLowsParser extends BinaryParser<HighsAndLows> {
    constructor(
        rainClicksToInchTransformer: (rainClicks: number) => number,
        unitTransformers: UnitTransformers
    ) {
        super({
            pressure: {
                day: {
                    low: {
                        type: Type.UINT16,
                        position: 0,
                        nullables: nullables.pressure,
                        transform: [
                            transformers.pressure,
                            unitTransformers.pressure,
                        ],
                        dependsOn: "lowTime",
                    },
                    high: {
                        type: Type.UINT16,
                        position: 2,
                        nullables: nullables.pressure,
                        transform: [
                            transformers.pressure,
                            unitTransformers.pressure,
                        ],
                        dependsOn: "highTime",
                    },
                    lowTime: {
                        type: Type.UINT16,
                        position: 12,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "low",
                    },
                    highTime: {
                        type: Type.UINT16,
                        position: 14,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "high",
                    },
                },
                month: {
                    low: {
                        type: Type.UINT16,
                        position: 4,
                        nullables: nullables.pressure,
                        transform: [
                            transformers.pressure,
                            unitTransformers.pressure,
                        ],
                    },
                    high: {
                        type: Type.UINT16,
                        position: 6,
                        nullables: nullables.pressure,
                        transform: [
                            transformers.pressure,
                            unitTransformers.pressure,
                        ],
                    },
                },
                year: {
                    low: {
                        type: Type.UINT16,
                        position: 8,
                        nullables: nullables.pressure,
                        transform: [
                            transformers.pressure,
                            unitTransformers.pressure,
                        ],
                    },
                    high: {
                        type: Type.UINT16,
                        position: 10,
                        nullables: nullables.pressure,
                        transform: [
                            transformers.pressure,
                            unitTransformers.pressure,
                        ],
                    },
                },
            },
            wind: {
                day: {
                    type: Type.UINT8,
                    position: 16,
                    dependsOn: "dayTime",
                    transform: [unitTransformers.wind],
                },
                dayTime: {
                    type: Type.UINT16,
                    position: 17,
                    nullables: nullables.time,
                    transform: [transformers.time],
                    dependsOn: "day",
                },
                month: {
                    type: Type.UINT8,
                    position: 19,
                    transform: [unitTransformers.wind],
                },
                year: {
                    type: Type.UINT8,
                    position: 20,
                    transform: [unitTransformers.wind],
                },
            },
            tempIn: {
                day: {
                    low: {
                        type: Type.INT16,
                        position: 23,
                        nullables: nullables.tempLow,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                        dependsOn: "lowTime",
                    },
                    high: {
                        type: Type.INT16,
                        position: 21,
                        nullables: nullables.tempHigh,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                        dependsOn: "highTime",
                    },
                    lowTime: {
                        type: Type.UINT16,
                        position: 27,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "low",
                    },
                    highTime: {
                        type: Type.UINT16,
                        position: 25,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "high",
                    },
                },
                month: {
                    low: {
                        type: Type.INT16,
                        position: 29,
                        nullables: nullables.tempLow,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                    },
                    high: {
                        type: Type.INT16,
                        position: 31,
                        nullables: nullables.tempHigh,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                    },
                },
                year: {
                    low: {
                        type: Type.INT16,
                        position: 33,
                        nullables: nullables.tempLow,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                    },
                    high: {
                        type: Type.INT16,
                        position: 35,
                        nullables: nullables.tempHigh,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                    },
                },
            },
            humIn: {
                day: {
                    low: {
                        type: Type.UINT8,
                        position: 38,
                        nullables: nullables.humidity,
                        dependsOn: "lowTime",
                    },
                    high: {
                        type: Type.UINT8,
                        position: 37,
                        nullables: nullables.humidity,
                        dependsOn: "highTime",
                    },
                    lowTime: {
                        type: Type.UINT16,
                        position: 41,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "low",
                    },
                    highTime: {
                        type: Type.UINT16,
                        position: 39,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "high",
                    },
                },
                month: {
                    low: {
                        type: Type.UINT8,
                        position: 44,
                        nullables: nullables.humidity,
                    },
                    high: {
                        type: Type.UINT8,
                        position: 43,
                        nullables: nullables.humidity,
                    },
                },
                year: {
                    low: {
                        type: Type.UINT8,
                        position: 46,
                        nullables: nullables.humidity,
                    },
                    high: {
                        type: Type.UINT8,
                        position: 45,
                        nullables: nullables.humidity,
                    },
                },
            },
            tempOut: {
                day: {
                    low: {
                        type: Type.INT16,
                        position: 47,
                        nullables: nullables.tempLow,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                        dependsOn: "lowTime",
                    },
                    high: {
                        type: Type.INT16,
                        position: 49,
                        nullables: nullables.tempHigh,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                        dependsOn: "highTime",
                    },
                    lowTime: {
                        type: Type.UINT16,
                        position: 51,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "low",
                    },
                    highTime: {
                        type: Type.UINT16,
                        position: 53,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "high",
                    },
                },
                month: {
                    low: {
                        type: Type.INT16,
                        position: 57,
                        nullables: nullables.tempLow,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                    },
                    high: {
                        type: Type.INT16,
                        position: 55,
                        nullables: nullables.tempHigh,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                    },
                },
                year: {
                    low: {
                        type: Type.INT16,
                        position: 61,
                        nullables: nullables.tempLow,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                    },
                    high: {
                        type: Type.INT16,
                        position: 59,
                        nullables: nullables.tempHigh,
                        transform: [
                            transformers.temperature,
                            unitTransformers.temperature,
                        ],
                    },
                },
            },
            dew: {
                day: {
                    low: {
                        type: Type.INT16,
                        position: 63,
                        nullables: nullables.tempLow,
                        dependsOn: "lowTime",
                        transform: [unitTransformers.temperature],
                    },
                    high: {
                        type: Type.INT16,
                        position: 65,
                        nullables: nullables.tempHigh,
                        dependsOn: "highTime",
                        transform: [unitTransformers.temperature],
                    },
                    lowTime: {
                        type: Type.UINT16,
                        position: 67,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "low",
                    },
                    highTime: {
                        type: Type.UINT16,
                        position: 69,
                        nullables: nullables.time,
                        transform: [transformers.time],
                        dependsOn: "high",
                    },
                },
                month: {
                    low: {
                        type: Type.INT16,
                        position: 73,
                        nullables: nullables.tempLow,
                        transform: [unitTransformers.temperature],
                    },
                    high: {
                        type: Type.INT16,
                        position: 71,
                        nullables: nullables.tempHigh,
                        transform: [unitTransformers.temperature],
                    },
                },
                year: {
                    low: {
                        type: Type.INT16,
                        position: 77,
                        nullables: nullables.tempLow,
                        transform: [unitTransformers.temperature],
                    },
                    high: {
                        type: Type.INT16,
                        position: 75,
                        nullables: nullables.tempHigh,
                        transform: [unitTransformers.temperature],
                    },
                },
            },
            chill: {
                day: {
                    type: Type.INT16,
                    position: 79,
                    nullables: nullables.chill,
                    dependsOn: "dayTime",
                    transform: [unitTransformers.temperature],
                },
                dayTime: {
                    type: Type.UINT16,
                    position: 81,
                    nullables: nullables.time,
                    transform: [transformers.time],
                    dependsOn: "day",
                },
                month: {
                    type: Type.INT16,
                    position: 83,
                    nullables: nullables.chill,
                    transform: [unitTransformers.temperature],
                },
                year: {
                    type: Type.INT16,
                    position: 85,
                    nullables: nullables.chill,
                    transform: [unitTransformers.temperature],
                },
            },
            heat: {
                day: {
                    type: Type.INT16,
                    position: 87,
                    nullables: nullables.heat,
                    dependsOn: "dayTime",
                    transform: [unitTransformers.temperature],
                },
                dayTime: {
                    type: Type.UINT16,
                    position: 89,
                    nullables: nullables.time,
                    transform: [transformers.time],
                    dependsOn: "day",
                },
                month: {
                    type: Type.INT16,
                    position: 91,
                    nullables: nullables.heat,
                    transform: [unitTransformers.temperature],
                },
                year: {
                    type: Type.INT16,
                    position: 93,
                    nullables: nullables.heat,
                    transform: [unitTransformers.temperature],
                },
            },
            thsw: {
                day: {
                    type: Type.INT16,
                    position: 95,
                    nullables: nullables.thsw,
                    dependsOn: "dayTime",
                },
                dayTime: {
                    type: Type.UINT16,
                    position: 97,
                    nullables: nullables.time,
                    transform: [transformers.time],
                    dependsOn: "day",
                },
                month: {
                    type: Type.INT16,
                    position: 99,
                    nullables: nullables.thsw,
                },
                year: {
                    type: Type.INT16,
                    position: 101,
                    nullables: nullables.thsw,
                },
            },
            solarRadiation: {
                month: {
                    type: Type.UINT16,
                    position: 107,
                    nullables: nullables.solar,
                    transform: [unitTransformers.solarRadiation],
                },
                year: {
                    type: Type.UINT16,
                    position: 109,
                    nullables: nullables.solar,
                    transform: [unitTransformers.solarRadiation],
                },
                day: {
                    type: Type.UINT16,
                    position: 103,
                    nullables: nullables.solar,
                    dependsOn: "dayTime",
                    transform: [unitTransformers.solarRadiation],
                },
                dayTime: {
                    type: Type.UINT16,
                    position: 105,
                    nullables: nullables.time,
                    transform: [transformers.time],
                    dependsOn: "day",
                },
            },
            uv: {
                month: {
                    type: Type.UINT8,
                    position: 114,
                    transform: [transformers.uv],
                },
                year: {
                    type: Type.UINT8,
                    position: 115,
                    transform: [transformers.uv],
                },
                day: {
                    type: Type.UINT8,
                    position: 111,
                    dependsOn: "dayTime",
                    transform: [transformers.uv],
                },
                dayTime: {
                    type: Type.UINT16,
                    position: 112,
                    nullables: nullables.time,
                    transform: [transformers.time],
                    dependsOn: "day",
                },
            },
            rainRate: {
                hour: {
                    type: Type.UINT16,
                    position: 120,
                    transform: [
                        rainClicksToInchTransformer,
                        unitTransformers.rain,
                    ],
                },
                day: {
                    type: Type.UINT16,
                    position: 116,
                    dependsOn: "dayTime",
                    transform: [
                        rainClicksToInchTransformer,
                        unitTransformers.rain,
                    ],
                },
                dayTime: {
                    type: Type.UINT16,
                    position: 118,
                    nullables: nullables.time,
                    transform: [transformers.time],
                    dependsOn: "day",
                },
                month: {
                    type: Type.UINT16,
                    position: 122,
                    transform: [
                        rainClicksToInchTransformer,
                        unitTransformers.rain,
                    ],
                },
                year: {
                    type: Type.UINT16,
                    position: 124,
                    transform: [
                        rainClicksToInchTransformer,
                        unitTransformers.rain,
                    ],
                },
            },
            extraTemps: [
                {
                    day: {
                        low: {
                            type: Type.UINT8,
                            position: 126,
                            nullables: nullables.extraTemp,
                            transform: [
                                transformers.extraTemp,
                                unitTransformers.temperature,
                            ],
                            dependsOn: "lowTime",
                        },
                        high: {
                            type: Type.UINT8,
                            position: 141,
                            nullables: nullables.extraTemp,
                            transform: [
                                transformers.extraTemp,
                                unitTransformers.temperature,
                            ],
                            dependsOn: "highTime",
                        },
                        lowTime: {
                            type: Type.UINT16,
                            position: 156,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "low",
                        },
                        highTime: {
                            type: Type.UINT16,
                            position: 186,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "high",
                        },
                    },
                    month: {
                        low: {
                            type: Type.UINT8,
                            position: 231,
                            nullables: nullables.extraTemp,
                            transform: [
                                transformers.extraTemp,
                                unitTransformers.temperature,
                            ],
                        },
                        high: {
                            type: Type.UINT8,
                            position: 216,
                            nullables: nullables.extraTemp,
                            transform: [
                                transformers.extraTemp,
                                unitTransformers.temperature,
                            ],
                        },
                    },
                    year: {
                        low: {
                            type: Type.UINT8,
                            position: 261,
                            nullables: nullables.extraTemp,
                            transform: [
                                transformers.extraTemp,
                                unitTransformers.temperature,
                            ],
                        },
                        high: {
                            type: Type.UINT8,
                            position: 246,
                            nullables: nullables.extraTemp,
                            transform: [
                                transformers.extraTemp,
                                unitTransformers.temperature,
                            ],
                        },
                    },
                },
                7,
                ArrayType.PROPERTY_BASED,
            ],
            soilTemps: [
                {
                    day: {
                        low: {
                            type: Type.UINT8,
                            position: 133,
                            nullables: nullables.soilTemp,
                            transform: [
                                transformers.soilTemp,
                                unitTransformers.temperature,
                            ],
                            dependsOn: "lowTime",
                        },
                        high: {
                            type: Type.UINT8,
                            position: 148,
                            nullables: nullables.soilTemp,
                            transform: [
                                transformers.soilTemp,
                                unitTransformers.temperature,
                            ],
                            dependsOn: "highTime",
                        },
                        lowTime: {
                            type: Type.UINT16,
                            position: 163,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "low",
                        },
                        highTime: {
                            type: Type.UINT16,
                            position: 193,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "high",
                        },
                    },
                    month: {
                        low: {
                            type: Type.UINT8,
                            position: 238,
                            nullables: nullables.soilTemp,
                            transform: [
                                transformers.soilTemp,
                                unitTransformers.temperature,
                            ],
                        },
                        high: {
                            type: Type.UINT8,
                            position: 223,
                            nullables: nullables.soilTemp,
                            transform: [
                                transformers.soilTemp,
                                unitTransformers.temperature,
                            ],
                        },
                    },
                    year: {
                        low: {
                            type: Type.UINT8,
                            position: 268,
                            nullables: nullables.soilTemp,
                            transform: [
                                transformers.soilTemp,
                                unitTransformers.temperature,
                            ],
                        },
                        high: {
                            type: Type.UINT8,
                            position: 253,
                            nullables: nullables.soilTemp,
                            transform: [
                                transformers.soilTemp,
                                unitTransformers.temperature,
                            ],
                        },
                    },
                },
                4,
                ArrayType.PROPERTY_BASED,
            ],
            leafTemps: [
                {
                    day: {
                        low: {
                            type: Type.UINT8,
                            position: 137,
                            nullables: nullables.leafTemp,
                            transform: [
                                transformers.leafTemp,
                                unitTransformers.temperature,
                            ],
                            dependsOn: "lowTime",
                        },
                        high: {
                            type: Type.UINT8,
                            position: 152,
                            nullables: nullables.leafTemp,
                            transform: [
                                transformers.leafTemp,
                                unitTransformers.temperature,
                            ],
                            dependsOn: "highTime",
                        },
                        lowTime: {
                            type: Type.UINT16,
                            position: 167,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "low",
                        },
                        highTime: {
                            type: Type.UINT16,
                            position: 197,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "high",
                        },
                    },
                    month: {
                        low: {
                            type: Type.UINT8,
                            position: 242,
                            nullables: nullables.leafTemp,
                            transform: [
                                transformers.leafTemp,
                                unitTransformers.temperature,
                            ],
                        },
                        high: {
                            type: Type.UINT8,
                            position: 227,
                            nullables: nullables.leafTemp,
                            transform: [
                                transformers.leafTemp,
                                unitTransformers.temperature,
                            ],
                        },
                    },
                    year: {
                        low: {
                            type: Type.UINT8,
                            position: 272,
                            nullables: nullables.leafTemp,
                            transform: [
                                transformers.leafTemp,
                                unitTransformers.temperature,
                            ],
                        },
                        high: {
                            type: Type.UINT8,
                            position: 257,
                            nullables: nullables.leafTemp,
                            transform: [
                                transformers.leafTemp,
                                unitTransformers.temperature,
                            ],
                        },
                    },
                },
                4,
                ArrayType.PROPERTY_BASED,
            ],
            extraHums: [
                {
                    day: {
                        low: {
                            type: Type.UINT8,
                            position: 276,
                            nullables: nullables.humidity,
                            dependsOn: "lowTime",
                        },
                        high: {
                            type: Type.UINT8,
                            position: 284,
                            nullables: nullables.humidity,
                            dependsOn: "highTime",
                        },
                        lowTime: {
                            type: Type.UINT16,
                            position: 292,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "low",
                        },
                        highTime: {
                            type: Type.UINT16,
                            position: 308,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "high",
                        },
                    },
                    month: {
                        low: {
                            type: Type.UINT8,
                            position: 332,
                            nullables: nullables.humidity,
                        },
                        high: {
                            type: Type.UINT8,
                            position: 324,
                            nullables: nullables.humidity,
                        },
                    },
                    year: {
                        low: {
                            type: Type.UINT8,
                            position: 348,
                            nullables: nullables.humidity,
                        },
                        high: {
                            type: Type.UINT8,
                            position: 340,
                            nullables: nullables.humidity,
                        },
                    },
                },
                8,
                ArrayType.PROPERTY_BASED,
            ],
            soilMoistures: [
                {
                    day: {
                        low: {
                            type: Type.UINT8,
                            position: 368,
                            nullables: nullables.soilMoisture,
                            dependsOn: "lowTime",
                        },
                        high: {
                            type: Type.UINT8,
                            position: 356,
                            nullables: nullables.soilMoisture,
                            dependsOn: "highTime",
                        },
                        lowTime: {
                            type: Type.UINT16,
                            position: 372,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "low",
                        },
                        highTime: {
                            type: Type.UINT16,
                            position: 360,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "high",
                        },
                    },
                    month: {
                        low: {
                            type: Type.UINT8,
                            position: 380,
                            nullables: nullables.soilMoisture,
                        },
                        high: {
                            type: Type.UINT8,
                            position: 384,
                            nullables: nullables.soilMoisture,
                        },
                    },
                    year: {
                        low: {
                            type: Type.UINT8,
                            position: 388,
                            nullables: nullables.soilMoisture,
                        },
                        high: {
                            type: Type.UINT8,
                            position: 392,
                            nullables: nullables.soilMoisture,
                        },
                    },
                },
                4,
                ArrayType.PROPERTY_BASED,
            ],
            leafWetnesses: [
                {
                    day: {
                        low: {
                            type: Type.UINT8,
                            position: 408,
                            nullables: nullables.leafWetness,
                            dependsOn: "lowTime",
                        },
                        high: {
                            type: Type.UINT8,
                            position: 396,
                            nullables: nullables.leafWetness,
                            dependsOn: "highTime",
                        },
                        lowTime: {
                            type: Type.UINT16,
                            position: 412,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "low",
                        },
                        highTime: {
                            type: Type.UINT16,
                            position: 400,
                            nullables: nullables.time,
                            transform: [transformers.time],
                            dependsOn: "high",
                        },
                    },
                    month: {
                        low: {
                            type: Type.UINT8,
                            position: 420,
                            nullables: nullables.leafWetness,
                        },
                        high: {
                            type: Type.UINT8,
                            position: 424,
                            nullables: nullables.leafWetness,
                        },
                    },
                    year: {
                        low: {
                            type: Type.UINT8,
                            position: 428,
                            nullables: nullables.leafWetness,
                        },
                        high: {
                            type: Type.UINT8,
                            position: 432,
                            nullables: nullables.leafWetness,
                        },
                    },
                },
                4,
                ArrayType.PROPERTY_BASED,
            ],
        });
    }

    public parse(buffer: Buffer) {
        const parsed = super.parse(buffer) as any;
        // extract outside humidity from extraHums array
        parsed.humOut = parsed.extraHums.shift()!;

        const result = merge(new HighsAndLows(), parsed);
        return result as HighsAndLows;
    }
}
