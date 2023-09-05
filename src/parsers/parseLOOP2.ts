import merge from "lodash.merge";
import { LOOP2, LOOPPackageType } from "vant-environment/structures";
import { Length, parse, ParseEntry, Types } from "../util/binary-parser";
import { Pipeline } from "../util/binary-parser/BetterPipeline";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/createUnitTransformers";

export default function (
    buffer: Buffer,
    rainClicksToInchTransformer: (rainClicks: number) => number,
    unitTransformers: UnitTransformers
): LOOP2 {
    const parsed = parse<LOOP2>(buffer, {
        press: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(7),
            transform: Pipeline(
                transformers.pressure,
                unitTransformers.pressure
            ),
            nullables: nullables.pressure,
        }),
        pressRaw: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(65),
            transform: Pipeline(
                transformers.pressure,
                unitTransformers.pressure
            ),
        }),
        pressAbs: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(67),
            transform: Pipeline(
                transformers.pressure,
                unitTransformers.pressure
            ),
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
        pressReductionMethodID: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(60),
            transform: (val) => {
                switch (val) {
                    case 0:
                    case 1:
                    case 2:
                        return val;
                    default:
                        return null;
                }
            },
        }),
        pressReductionMethod: ParseEntry.dependsOn({
            dependsOn: "pressReductionMethodID",
            transform: (val) => {
                switch (val) {
                    case 0:
                        return "user offset";
                    case 1:
                        return "altimeter setting";
                    case 2:
                        return "NOAA bar reduction";
                    default:
                        return null;
                }
            },
        }),
        pressUserOffset: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(61),
            transform: (val) => val / 1000,
        }),
        pressCalibrationOffset: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(63),
            transform: (val) => val / 1000,
        }),
        altimeter: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(69),
            transform: Pipeline((val) => val / 1000, unitTransformers.pressure),
        }),
        heat: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(35),
            nullables: [255],
            transform: unitTransformers.temperature,
        }),
        dewpoint: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(30),
            nullables: [255],
            transform: unitTransformers.temperature,
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
        tempOut: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(12),
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
        windAvg2m: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(20),
            transform: Pipeline((val) => val / 10, unitTransformers.wind),
        }),
        windAvg10m: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(18),
            transform: Pipeline((val) => val / 10, unitTransformers.wind),
        }),
        windDirDeg: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(16),
        }),
        windDir: ParseEntry.dependsOn({
            dependsOn: "windDirDeg",
            transform: transformers.windDir,
        }),
        windGustDirDeg: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(24),
        }),
        windGustDir: ParseEntry.dependsOn({
            dependsOn: "windGustDirDeg",
            transform: transformers.windDir,
        }),
        windGust: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(22),
            transform: unitTransformers.wind,
        }),
        chill: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(37),
            nullables: [255],
            transform: unitTransformers.temperature,
        }),
        thsw: ParseEntry.create({
            type: Types.INT16,
            offset: Length.BYTES(39),
            nullables: [255],
            transform: unitTransformers.temperature,
        }),
        rainRate: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(41),
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
        rainDay: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(50),
            transform: Pipeline(
                rainClicksToInchTransformer,
                unitTransformers.rain
            ),
        }),
        rain15m: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(52),
            transform: Pipeline(
                rainClicksToInchTransformer,
                unitTransformers.rain
            ),
        }),
        rain1h: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(54),
            transform: Pipeline(
                rainClicksToInchTransformer,
                unitTransformers.rain
            ),
        }),
        rain24h: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(58),
            transform: Pipeline(
                rainClicksToInchTransformer,
                unitTransformers.rain
            ),
        }),
        etDay: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(56),
            nullables: [65535],
            transform: Pipeline(transformers.dayET, unitTransformers.rain),
        }),
        uv: ParseEntry.create({
            type: Types.UINT8,
            offset: Length.BYTES(43),
            nullables: nullables.uv,
        }),
        solarRadiation: ParseEntry.create({
            type: Types.UINT16,
            offset: Length.BYTES(44),
            nullables: nullables.solar,
            transform: unitTransformers.solarRadiation,
        }),
        graphPointers: {
            next10mWindSpeed: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(73),
            }),
            next15mWindSpeed: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(74),
            }),
            nextHourWindSpeed: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(75),
            }),
            nextDailyWindSpeed: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(76),
            }),
            nextMinuteRain: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(77),
            }),
            nextMonthlyRain: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(80),
            }),
            nextYearlyRain: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(81),
            }),
            nextSeasonalRain: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(82),
            }),
            nextRainStorm: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(78),
            }),
            currentMinuteIndex: ParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(79),
            }),
        },
        time: new Date(),
        packageType: LOOPPackageType.LOOP2,
    });
    return merge(new LOOP2(), parsed);
}
