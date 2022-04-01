import merge from "lodash.merge";
import { HighsAndLows } from "../structures";
import { Length, parse, ParseEntry, Types } from "../util/binary-parser";
import { Pipeline } from "../util/binary-parser/BetterPipeline";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/createUnitTransformers";

export default function (
    buffer: Buffer,
    rainClicksToInchTransformer: (rainClicks: number) => number,
    unitTransformers: UnitTransformers
): HighsAndLows {
    const parsed = parse<HighsAndLows>(buffer, {
        pressure: {
            day: {
                low: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(0),
                    nullables: nullables.pressure,
                    transform: Pipeline(
                        transformers.pressure,
                        unitTransformers.pressure
                    ),
                    nullWith: "lowTime",
                }),
                high: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(2),
                    nullables: nullables.pressure,
                    transform: Pipeline(
                        transformers.pressure,
                        unitTransformers.pressure
                    ),
                    nullWith: "highTime",
                }),
                lowTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(12),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "low",
                }),
                highTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(14),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "high",
                }),
            },
            month: {
                low: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(4),
                    nullables: nullables.pressure,
                    transform: Pipeline(
                        transformers.pressure,
                        unitTransformers.pressure
                    ),
                }),
                high: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(6),
                    nullables: nullables.pressure,
                    transform: Pipeline(
                        transformers.pressure,
                        unitTransformers.pressure
                    ),
                }),
            },
            year: {
                low: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(8),
                    nullables: nullables.pressure,
                    transform: Pipeline(
                        transformers.pressure,
                        unitTransformers.pressure
                    ),
                }),
                high: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(10),
                    nullables: nullables.pressure,
                    transform: Pipeline(
                        transformers.pressure,
                        unitTransformers.pressure
                    ),
                }),
            },
        },
        wind: {
            day: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(16),
                nullWith: "dayTime",
                transform: Pipeline(unitTransformers.wind),
            }),
            dayTime: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(17),
                nullables: nullables.time,
                transform: Pipeline(transformers.time),
                nullWith: "day",
            }),
            month: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(19),
                transform: Pipeline(unitTransformers.wind),
            }),
            year: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(20),
                transform: Pipeline(unitTransformers.wind),
            }),
        },
        tempIn: {
            day: {
                low: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(23),
                    nullables: nullables.tempLow,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                    nullWith: "lowTime",
                }),
                high: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(21),
                    nullables: nullables.tempHigh,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                    nullWith: "highTime",
                }),
                lowTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(27),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "low",
                }),
                highTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(25),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "high",
                }),
            },
            month: {
                low: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(29),
                    nullables: nullables.tempLow,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                }),
                high: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(31),
                    nullables: nullables.tempHigh,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                }),
            },
            year: {
                low: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(33),
                    nullables: nullables.tempLow,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                }),
                high: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(35),
                    nullables: nullables.tempHigh,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                }),
            },
        },
        humIn: {
            day: {
                low: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(38),
                    nullables: nullables.humidity,
                    nullWith: "lowTime",
                }),
                high: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(37),
                    nullables: nullables.humidity,
                    nullWith: "highTime",
                }),
                lowTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(41),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "low",
                }),
                highTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(39),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "high",
                }),
            },
            month: {
                low: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(44),
                    nullables: nullables.humidity,
                }),
                high: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(43),
                    nullables: nullables.humidity,
                }),
            },
            year: {
                low: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(46),
                    nullables: nullables.humidity,
                }),
                high: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(45),
                    nullables: nullables.humidity,
                }),
            },
        },
        tempOut: {
            day: {
                low: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(47),
                    nullables: nullables.tempLow,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                    nullWith: "lowTime",
                }),
                high: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(49),
                    nullables: nullables.tempHigh,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                    nullWith: "highTime",
                }),
                lowTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(51),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "low",
                }),
                highTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(53),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "high",
                }),
            },
            month: {
                low: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(57),
                    nullables: nullables.tempLow,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                }),
                high: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(55),
                    nullables: nullables.tempHigh,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                }),
            },
            year: {
                low: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(61),
                    nullables: nullables.tempLow,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                }),
                high: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(59),
                    nullables: nullables.tempHigh,
                    transform: Pipeline(
                        transformers.temperature,
                        unitTransformers.temperature
                    ),
                }),
            },
        },
        dew: {
            day: {
                low: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(63),
                    nullables: nullables.tempLow,
                    nullWith: "lowTime",
                    transform: Pipeline(unitTransformers.temperature),
                }),
                high: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(65),
                    nullables: nullables.tempHigh,
                    nullWith: "highTime",
                    transform: Pipeline(unitTransformers.temperature),
                }),
                lowTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(67),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "low",
                }),
                highTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(69),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "high",
                }),
            },
            month: {
                low: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(73),
                    nullables: nullables.tempLow,
                    transform: Pipeline(unitTransformers.temperature),
                }),
                high: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(71),
                    nullables: nullables.tempHigh,
                    transform: Pipeline(unitTransformers.temperature),
                }),
            },
            year: {
                low: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(77),
                    nullables: nullables.tempLow,
                    transform: Pipeline(unitTransformers.temperature),
                }),
                high: ParseEntry.create({
                    type: Types.INT16,
                    offset: Length.BYTES(75),
                    nullables: nullables.tempHigh,
                    transform: Pipeline(unitTransformers.temperature),
                }),
            },
        },
        chill: {
            day: ParseEntry.create({
                type: Types.INT16,
                offset: Length.BYTES(79),
                nullables: nullables.chill,
                nullWith: "dayTime",
                transform: Pipeline(unitTransformers.temperature),
            }),
            dayTime: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(81),
                nullables: nullables.time,
                transform: Pipeline(transformers.time),
                nullWith: "day",
            }),
            month: ParseEntry.create({
                type: Types.INT16,
                offset: Length.BYTES(83),
                nullables: nullables.chill,
                transform: Pipeline(unitTransformers.temperature),
            }),
            year: ParseEntry.create({
                type: Types.INT16,
                offset: Length.BYTES(85),
                nullables: nullables.chill,
                transform: Pipeline(unitTransformers.temperature),
            }),
        },
        heat: {
            day: ParseEntry.create({
                type: Types.INT16,
                offset: Length.BYTES(87),
                nullables: nullables.heat,
                nullWith: "dayTime",
                transform: Pipeline(unitTransformers.temperature),
            }),
            dayTime: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(89),
                nullables: nullables.time,
                transform: Pipeline(transformers.time),
                nullWith: "day",
            }),
            month: ParseEntry.create({
                type: Types.INT16,
                offset: Length.BYTES(91),
                nullables: nullables.heat,
                transform: Pipeline(unitTransformers.temperature),
            }),
            year: ParseEntry.create({
                type: Types.INT16,
                offset: Length.BYTES(93),
                nullables: nullables.heat,
                transform: Pipeline(unitTransformers.temperature),
            }),
        },
        thsw: {
            day: ParseEntry.create({
                type: Types.INT16,
                offset: Length.BYTES(95),
                nullables: nullables.thsw,
                nullWith: "dayTime",
            }),
            dayTime: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(97),
                nullables: nullables.time,
                transform: Pipeline(transformers.time),
                nullWith: "day",
            }),
            month: ParseEntry.create({
                type: Types.INT16,
                offset: Length.BYTES(99),
                nullables: nullables.thsw,
            }),
            year: ParseEntry.create({
                type: Types.INT16,
                offset: Length.BYTES(101),
                nullables: nullables.thsw,
            }),
        },
        solarRadiation: {
            month: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(107),
                nullables: nullables.solar,
                transform: Pipeline(unitTransformers.solarRadiation),
            }),
            year: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(109),
                nullables: nullables.solar,
                transform: Pipeline(unitTransformers.solarRadiation),
            }),
            day: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(103),
                nullables: nullables.solar,
                nullWith: "dayTime",
                transform: Pipeline(unitTransformers.solarRadiation),
            }),
            dayTime: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(105),
                nullables: nullables.time,
                transform: Pipeline(transformers.time),
                nullWith: "day",
            }),
        },
        uv: {
            month: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(114),
                transform: Pipeline(transformers.uv),
            }),
            year: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(115),
                transform: Pipeline(transformers.uv),
            }),
            day: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(111),
                nullWith: "dayTime",
                transform: Pipeline(transformers.uv),
            }),
            dayTime: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(112),
                nullables: nullables.time,
                transform: Pipeline(transformers.time),
                nullWith: "day",
            }),
        },
        rainRate: {
            hour: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(120),
                transform: Pipeline(
                    rainClicksToInchTransformer,
                    unitTransformers.rain
                ),
            }),
            day: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(116),
                nullWith: "dayTime",
                transform: Pipeline(
                    rainClicksToInchTransformer,
                    unitTransformers.rain
                ),
            }),
            dayTime: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(118),
                nullables: nullables.time,
                transform: Pipeline(transformers.time),
                nullWith: "day",
            }),
            month: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(122),
                transform: Pipeline(
                    rainClicksToInchTransformer,
                    unitTransformers.rain
                ),
            }),
            year: ParseEntry.create({
                type: Types.UINT16,
                offset: Length.BYTES(124),
                transform: Pipeline(
                    rainClicksToInchTransformer,
                    unitTransformers.rain
                ),
            }),
        },
        extraTemps: [
            {
                day: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.ZERO(),
                        nullables: nullables.extraTemp,
                        transform: Pipeline(
                            transformers.extraTemp,
                            unitTransformers.temperature
                        ),
                        nullWith: "lowTime",
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(15),
                        nullables: nullables.extraTemp,
                        transform: Pipeline(
                            transformers.extraTemp,
                            unitTransformers.temperature
                        ),
                        nullWith: "highTime",
                    }),
                    lowTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(30),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "low",
                    }),
                    highTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(60),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "high",
                    }),
                },
                month: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(105),
                        nullables: nullables.extraTemp,
                        transform: Pipeline(
                            transformers.extraTemp,
                            unitTransformers.temperature
                        ),
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(90),
                        nullables: nullables.extraTemp,
                        transform: Pipeline(
                            transformers.extraTemp,
                            unitTransformers.temperature
                        ),
                    }),
                },
                year: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(135),
                        nullables: nullables.extraTemp,
                        transform: Pipeline(
                            transformers.extraTemp,
                            unitTransformers.temperature
                        ),
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(120),
                        nullables: nullables.extraTemp,
                        transform: Pipeline(
                            transformers.extraTemp,
                            unitTransformers.temperature
                        ),
                    }),
                },
            },
            {
                length: 7,
                offset: Length.BYTES(126),
            },
        ],
        soilTemps: [
            {
                day: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(0),
                        nullables: nullables.soilTemp,
                        transform: Pipeline(
                            transformers.soilTemp,
                            unitTransformers.temperature
                        ),
                        nullWith: "lowTime",
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(15),
                        nullables: nullables.soilTemp,
                        transform: Pipeline(
                            transformers.soilTemp,
                            unitTransformers.temperature
                        ),
                        nullWith: "highTime",
                    }),
                    lowTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(30),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "low",
                    }),
                    highTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(60),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "high",
                    }),
                },
                month: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(105),
                        nullables: nullables.soilTemp,
                        transform: Pipeline(
                            transformers.soilTemp,
                            unitTransformers.temperature
                        ),
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(90),
                        nullables: nullables.soilTemp,
                        transform: Pipeline(
                            transformers.soilTemp,
                            unitTransformers.temperature
                        ),
                    }),
                },
                year: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(135),
                        nullables: nullables.soilTemp,
                        transform: Pipeline(
                            transformers.soilTemp,
                            unitTransformers.temperature
                        ),
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(120),
                        nullables: nullables.soilTemp,
                        transform: Pipeline(
                            transformers.soilTemp,
                            unitTransformers.temperature
                        ),
                    }),
                },
            },
            {
                length: 4,
                offset: Length.BYTES(137),
            },
        ],
        leafTemps: [
            {
                day: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(0),
                        nullables: nullables.leafTemp,
                        transform: Pipeline(
                            transformers.leafTemp,
                            unitTransformers.temperature
                        ),
                        nullWith: "lowTime",
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(15),
                        nullables: nullables.leafTemp,
                        transform: Pipeline(
                            transformers.leafTemp,
                            unitTransformers.temperature
                        ),
                        nullWith: "highTime",
                    }),
                    lowTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(30),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "low",
                    }),
                    highTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(60),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "high",
                    }),
                },
                month: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(105),
                        nullables: nullables.leafTemp,
                        transform: Pipeline(
                            transformers.leafTemp,
                            unitTransformers.temperature
                        ),
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(90),
                        nullables: nullables.leafTemp,
                        transform: Pipeline(
                            transformers.leafTemp,
                            unitTransformers.temperature
                        ),
                    }),
                },
                year: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(135),
                        nullables: nullables.leafTemp,
                        transform: Pipeline(
                            transformers.leafTemp,
                            unitTransformers.temperature
                        ),
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(120),
                        nullables: nullables.leafTemp,
                        transform: Pipeline(
                            transformers.leafTemp,
                            unitTransformers.temperature
                        ),
                    }),
                },
            },
            {
                length: 4,
                offset: Length.BYTES(133),
            },
        ],
        extraHums: [
            {
                day: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(0),
                        nullables: nullables.humidity,
                        nullWith: "lowTime",
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(8),
                        nullables: nullables.humidity,
                        nullWith: "highTime",
                    }),
                    lowTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(16),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "low",
                    }),
                    highTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(32),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "high",
                    }),
                },
                month: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(56),
                        nullables: nullables.humidity,
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(48),
                        nullables: nullables.humidity,
                    }),
                },
                year: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(72),
                        nullables: nullables.humidity,
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(64),
                        nullables: nullables.humidity,
                    }),
                },
            },
            {
                length: 7,
                offset: Length.BYTES(277),
            },
        ],
        soilMoistures: [
            {
                day: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(12),
                        nullables: nullables.soilMoisture,
                        nullWith: "lowTime",
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(0),
                        nullables: nullables.soilMoisture,
                        nullWith: "highTime",
                    }),
                    lowTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(16),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "low",
                    }),
                    highTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(4),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "high",
                    }),
                },
                month: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(24),
                        nullables: nullables.soilMoisture,
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(28),
                        nullables: nullables.soilMoisture,
                    }),
                },
                year: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(32),
                        nullables: nullables.soilMoisture,
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(36),
                        nullables: nullables.soilMoisture,
                    }),
                },
            },
            {
                length: 4,
                offset: Length.BYTES(356),
            },
        ],
        leafWetnesses: [
            {
                day: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(12),
                        nullables: nullables.leafWetness,
                        nullWith: "lowTime",
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(0),
                        nullables: nullables.leafWetness,
                        nullWith: "highTime",
                    }),
                    lowTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(16),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "low",
                    }),
                    highTime: ParseEntry.create({
                        type: Types.UINT16,
                        offset: Length.BYTES(4),
                        nullables: nullables.time,
                        transform: Pipeline(transformers.time),
                        nullWith: "high",
                    }),
                },
                month: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(24),
                        nullables: nullables.leafWetness,
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(28),
                        nullables: nullables.leafWetness,
                    }),
                },
                year: {
                    low: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(32),
                        nullables: nullables.leafWetness,
                    }),
                    high: ParseEntry.create({
                        type: Types.UINT8,
                        offset: Length.BYTES(36),
                        nullables: nullables.leafWetness,
                    }),
                },
            },
            {
                length: 4,
                offset: Length.BYTES(396),
            },
        ],
        humOut: {
            day: {
                low: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(276),
                    nullables: nullables.humidity,
                    nullWith: "lowTime",
                }),
                high: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(284),
                    nullables: nullables.humidity,
                    nullWith: "highTime",
                }),
                lowTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(292),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "low",
                }),
                highTime: ParseEntry.create({
                    type: Types.UINT16,
                    offset: Length.BYTES(308),
                    nullables: nullables.time,
                    transform: Pipeline(transformers.time),
                    nullWith: "high",
                }),
            },
            month: {
                low: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(332),
                    nullables: nullables.humidity,
                }),
                high: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(324),
                    nullables: nullables.humidity,
                }),
            },
            year: {
                low: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(348),
                    nullables: nullables.humidity,
                }),
                high: ParseEntry.create({
                    type: Types.UINT8,
                    offset: Length.BYTES(340),
                    nullables: nullables.humidity,
                }),
            },
        },
    });

    return merge(new HighsAndLows(), parsed);
}
