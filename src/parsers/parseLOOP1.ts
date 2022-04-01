import merge from "lodash.merge";
import { LOOP1, LOOPPackageType } from "../structures";
import {
    ArrayParseEntry,
    Types,
    Length,
    ParseEntry,
    parse,
} from "../util/binary-parser";
import { ArrayPipeline, Pipeline } from "../util/binary-parser/BetterPipeline";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/createUnitTransformers";

/**
 * Parses the passed data to LOOP1 package.
 * @param buffer the buffer to parse
 * @param rainClicksToInchTransformer the transformer used to convert the internally used rain clicks to inch/h
 * @param unitTransformers the unit transformers to convert the weather data to any desired unit
 * @returns a LOOP1 package
 */
export default function (
    buffer: Buffer,
    rainClicksToInchTransformer: (rainClicks: number) => number,
    unitTransformers: UnitTransformers
) {
    const parsed = parse<LOOP1>(buffer, {
        tempExtra: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                nullables: nullables.extraTemp,
                transform: ArrayPipeline(
                    transformers.extraTemp,
                    unitTransformers.temperature
                ),
            }),
            {
                length: 7,
                offset: Length.BYTES(18),
            },
        ],
        leafTemps: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                nullables: nullables.leafTemp,
                transform: ArrayPipeline(
                    transformers.leafTemp,
                    unitTransformers.temperature
                ),
            }),
            {
                length: 4,
                offset: Length.BYTES(29),
            },
        ],
        soilTemps: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                nullables: nullables.soilTemp,
                transform: ArrayPipeline(
                    transformers.soilTemp,
                    unitTransformers.temperature
                ),
            }),
            {
                length: 4,
                offset: Length.BYTES(25),
            },
        ],
        humExtra: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                nullables: nullables.humidity,
            }),
            {
                length: 7,
                offset: Length.BYTES(34),
            },
        ],
        rainMonth: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(52),
            transform: Pipeline(
                rainClicksToInchTransformer,
                unitTransformers.rain
            ),
        }),
        rainYear: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(54),
            transform: Pipeline(
                rainClicksToInchTransformer,
                unitTransformers.rain
            ),
        }),
        etMonth: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(58),
            nullables: [65535],
            transform: Pipeline(transformers.monthET, unitTransformers.rain),
        }),
        etYear: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(60),
            nullables: [255],
            transform: Pipeline(transformers.yearET, unitTransformers.rain),
        }),
        soilMoistures: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                nullables: [255],
            }),
            {
                length: 4,
                offset: Length.BYTES(62),
            },
        ],
        leafWetnesses: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                nullables: [255],
            }),
            {
                length: 4,
                offset: Length.BYTES(66),
            },
        ],
        forecast: ParseEntry.dependsOn({
            dependsOn: "forecastID",
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
        }),
        forecastID: ParseEntry.create({
            type: Types.INT8,
            offset: Length.BYTES(89),
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
        }),
        forecastRule: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(90),
            nullWith: "forecastID",
        }),
        nextArchiveRecord: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(5),
        }),
        alarms: {
            pressure: {
                falling: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(70),
                }),
                rising: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(70).add(Length.BITS(1)),
                }),
            },
            tempIn: {
                low: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(70).add(Length.BITS(2)),
                }),
                high: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(70).add(Length.BITS(3)),
                }),
            },
            humIn: {
                low: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(70).add(Length.BITS(4)),
                }),
                high: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(70).add(Length.BITS(5)),
                }),
            },
            time: ParseEntry.create({
                type: Types.BOOLEAN,
                offset: Length.BYTES(70).add(Length.BITS(6)),
            }),
            rain: {
                rate: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(71),
                }),
                quarter: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(71).add(Length.BITS(1)),
                }),
                daily: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(71).add(Length.BITS(2)),
                }),
                stormTotal: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(71).add(Length.BITS(3)),
                }),
            },
            dailyET: ParseEntry.create({
                type: Types.BOOLEAN,
                offset: Length.BYTES(71).add(Length.BITS(4)),
            }),
            tempOut: {
                low: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(72),
                }),
                high: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(72).add(Length.BITS(1)),
                }),
            },
            wind: {
                speed: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(72).add(Length.BITS(2)),
                }),
                avg: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(72).add(Length.BITS(3)),
                }),
            },
            dewpoint: {
                low: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(72).add(Length.BITS(4)),
                }),
                high: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(72).add(Length.BITS(5)),
                }),
            },
            heat: ParseEntry.create({
                type: Types.BOOLEAN,
                offset: Length.BYTES(72).add(Length.BITS(6)),
            }),
            chill: ParseEntry.create({
                type: Types.BOOLEAN,
                offset: Length.BYTES(72).add(Length.BITS(7)),
            }),
            thsw: ParseEntry.create({
                type: Types.BOOLEAN,
                offset: Length.BYTES(73),
            }),
            solarRadiation: ParseEntry.create({
                type: Types.BOOLEAN,
                offset: Length.BYTES(73).add(Length.BITS(1)),
            }),
            UV: {
                dose: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(73).add(Length.BITS(3)),
                }),
                enabledAndCleared: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(73).add(Length.BITS(4)),
                }),
                high: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(73).add(Length.BITS(2)),
                }),
            },
            humOut: {
                low: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(74).add(Length.BITS(2)),
                }),
                high: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(74).add(Length.BITS(3)),
                }),
            },
            extraTemps: [
                {
                    low: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(0),
                    }),
                    high: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(1),
                    }),
                },
                {
                    gap: Length.BYTES(1),
                    length: 7,
                    offset: Length.BYTES(75),
                },
            ],
            extraHums: [
                {
                    low: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(0),
                    }),
                    high: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(1),
                    }),
                },
                {
                    length: 7,
                    gap: Length.BYTES(1),
                    offset: Length.BYTES(75).add(Length.BITS(2)),
                },
            ],
            leafWetnesses: [
                {
                    low: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(0),
                    }),
                    high: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(1),
                    }),
                },
                {
                    length: 4,
                    gap: Length.BYTES(1),
                    offset: Length.BYTES(82),
                },
            ],
            soilMoistures: [
                {
                    low: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(0),
                    }),
                    high: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(1),
                    }),
                },
                {
                    length: 4,
                    gap: Length.BYTES(1),
                    offset: Length.BYTES(82).add(Length.BITS(2)),
                },
            ],
            leafTemps: [
                {
                    low: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(0),
                    }),
                    high: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(1),
                    }),
                },
                {
                    length: 4,
                    gap: Length.BYTES(1),
                    offset: Length.BYTES(82).add(Length.BITS(4)),
                },
            ],
            soilTemps: [
                {
                    low: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(0),
                    }),
                    high: ParseEntry.create({
                        type: Types.BOOLEAN,
                        offset: Length.BITS(1),
                    }),
                },
                {
                    length: 4,
                    gap: Length.BYTES(1),
                    offset: Length.BYTES(82),
                },
            ],
        },
        transmitterBatteryStatus: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(86),
        }),
        consoleBatteryVoltage: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(87),
            transform: (val) => (val * 300) / 512 / 100,
        }),
        sunrise: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(91),
            nullables: nullables.time,
            transform: transformers.time,
        }),
        sunset: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(93),
            nullables: nullables.time,
            transform: transformers.time,
        }),
        packageType: LOOPPackageType.LOOP1,
        press: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(7),
            transform: Pipeline(
                transformers.pressure,
                unitTransformers.pressure
            ),
            nullables: nullables.pressure,
        }),
        pressTrend: ParseEntry.dependsOn({
            dependsOn: "pressTrendID",
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
        }),
        pressTrendID: ParseEntry.create({
            type: Types.INT8,
            offset: Length.BYTES(3),
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
        }),
        tempOut: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(12),
            nullables: nullables.temperature,
            transform: Pipeline(
                transformers.temperature,
                unitTransformers.temperature
            ),
        }),
        tempIn: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(9),
            nullables: nullables.temperature,
            transform: Pipeline(
                transformers.temperature,
                unitTransformers.temperature
            ),
        }),
        humIn: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(11),
            nullables: nullables.humidity,
        }),
        humOut: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(33),
            nullables: nullables.humidity,
        }),
        wind: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(14),
            transform: unitTransformers.wind,
        }),
        windAvg10m: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(15),
            transform: unitTransformers.wind,
        }),
        windDir: ParseEntry.dependsOn({
            dependsOn: "windDirDeg",
            transform: transformers.windDir,
        }),
        windDirDeg: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(16),
            nullables: [0],
        }),
        rainRate: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(41),
            transform: Pipeline(
                rainClicksToInchTransformer,
                unitTransformers.rain
            ),
        }),
        rainDay: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(50),
            transform: Pipeline(
                rainClicksToInchTransformer,
                unitTransformers.rain
            ),
        }),
        stormRain: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(46),
            transform: Pipeline(
                rainClicksToInchTransformer,
                unitTransformers.rain
            ),
            nullWith: "stormStartDate",
        }),
        stormStartDate: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(48),
            nullables: [-1, 0xffff],
            transform: transformers.stormStartDate,
        }),
        etDay: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(56),
            nullables: [65535],
            transform: Pipeline(transformers.dayET, unitTransformers.rain),
        }),
        uv: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(14),
            transform: unitTransformers.wind,
        }),
        solarRadiation: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(14),
            transform: unitTransformers.wind,
        }),
        time: new Date(),
    });
    return merge(new LOOP1(), parsed);
}
