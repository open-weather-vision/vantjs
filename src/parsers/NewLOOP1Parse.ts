import { LOOP1, LOOPPackageType } from "../structures";
import { AlarmData } from "../structures/subtypes";
import {
    ParseStructure,
    ArrayParseEntry,
    Types,
    Length,
    ParseEntry,
    parse,
} from "../util/binary-parser";
import { ArrayPipeline, Pipeline } from "../util/binary-parser/BetterPipeline";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/unitTransformers";

export default function (
    buffer: Buffer,
    rainClicksToInchTransformer: (rainClicks: number) => number,
    unitTransformers: UnitTransformers
) {
    return parse<LOOP1>(buffer, {
        tempExtra: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(0),
                nullables: nullables.extraTemp,
                transform: ArrayPipeline(
                    transformers.extraTemp,
                    unitTransformers.temperature
                ),
            }),
            {
                length: 7,
                gap: Length.BYTES(1),
                offset: Length.BYTES(18),
            },
        ],
        leafTemps: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(0),
                nullables: nullables.leafTemp,
                transform: ArrayPipeline(
                    transformers.leafTemp,
                    unitTransformers.temperature
                ),
            }),
            {
                length: 4,
                gap: Length.BYTES(1),
                offset: Length.BYTES(29),
            },
        ],
        soilTemps: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(0),
                nullables: nullables.soilTemp,
                transform: ArrayPipeline(
                    transformers.soilTemp,
                    unitTransformers.temperature
                ),
            }),
            {
                length: 4,
                gap: Length.BYTES(1),
                offset: Length.BYTES(25),
            },
        ],
        humExtra: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(0),
                nullables: nullables.humidity,
            }),
            {
                length: 7,
                gap: Length.BYTES(1),
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
                offset: Length.BYTES(0),
                nullables: [255],
            }),
            {
                length: 4,
                gap: Length.BYTES(1),
                offset: Length.BYTES(62),
            },
        ],
        leafWetnesses: [
            ArrayParseEntry.create({
                type: Types.UINT8,
                offset: Length.BYTES(0),
                nullables: [255],
            }),
            {
                length: 4,
                gap: Length.BYTES(1),
                offset: Length.BYTES(66),
            },
        ],
        forecast: null,
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
        alarms: new AlarmData(),
        transmitterBatteryStatus: null,
        consoleBatteryVoltage: null,
        sunrise: null,
        sunset: null,
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
}
