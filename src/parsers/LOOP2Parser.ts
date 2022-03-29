import BinaryParser, { Type } from "../util/BinaryParser";
import { LOOPPackageType } from "../structures/LOOPPackageType";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/unitTransformers";
import LOOP2 from "../structures/LOOP2";
import merge from "lodash.merge";

/**
 * Parser for a LOOP2 binary data package (without the acknowledgement byte and the crc bytes).
 */
export default class LOOP2Parser extends BinaryParser<LOOP2> {
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
            pressRaw: {
                type: Type.INT16,
                position: 65,
                transform: [transformers.pressure, unitTransformers.pressure],
            },
            pressAbs: {
                type: Type.INT16,
                position: 67,
                transform: [transformers.pressure, unitTransformers.pressure],
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
            pressReductionMethodID: { type: Type.UINT8, position: 60 },
            pressReductionMethod: {
                copyof: "pressReductionMethodID",
                transform: [
                    (val) => {
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
                ],
            },
            pressUserOffset: {
                type: Type.INT16,
                position: 61,
                transform: [(val) => val / 1000],
            },
            pressCalibrationOffset: {
                type: Type.INT16,
                position: 63,
                transform: [(val) => val / 1000],
            },
            altimeter: {
                type: Type.INT16,
                position: 69,
                transform: [(val) => val / 1000, unitTransformers.pressure],
            },
            heat: {
                type: Type.INT16,
                position: 35,
                nullables: [255],
                transform: [unitTransformers.temperature],
            },
            dewpoint: {
                type: Type.INT16,
                position: 30,
                nullables: [255],
                transform: [unitTransformers.temperature],
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
            wind: {
                type: Type.UINT8,
                position: 14,
                transform: [unitTransformers.wind],
            },
            windAvg2m: {
                type: Type.UINT16,
                position: 20,
                transform: [(val) => val / 10, unitTransformers.wind],
            },
            windAvg10m: {
                type: Type.UINT16,
                position: 18,
                transform: [(val) => val / 10, unitTransformers.wind],
            },
            windDirDeg: {
                type: Type.UINT16,
                position: 16,
            },
            windDir: {
                copyof: "windDirDeg",
                transform: [transformers.windDir],
            },
            windGustDirDeg: {
                type: Type.UINT16,
                position: 24,
            },
            windGustDir: {
                copyof: "windGustDirDeg",
                transform: [transformers.windDir],
            },
            windGust: {
                type: Type.UINT16,
                position: 22,
                transform: [unitTransformers.wind],
            },
            chill: {
                type: Type.INT16,
                position: 37,
                nullables: [255],
                transform: [unitTransformers.temperature],
            },
            thsw: {
                type: Type.INT16,
                position: 39,
                nullables: [255],
                transform: [unitTransformers.temperature],
            },
            rainRate: {
                type: Type.UINT16,
                position: 41,
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
            rainDay: {
                type: Type.UINT16,
                position: 50,
                transform: [rainClicksToInchTransformer, unitTransformers.rain],
            },
            rain15m: {
                type: Type.UINT16,
                position: 52,
                transform: [rainClicksToInchTransformer, unitTransformers.rain],
            },
            rain1h: {
                type: Type.UINT16,
                position: 54,
                transform: [rainClicksToInchTransformer, unitTransformers.rain],
            },
            rain24h: {
                type: Type.UINT16,
                position: 58,
                transform: [rainClicksToInchTransformer, unitTransformers.rain],
            },
            etDay: {
                type: Type.UINT16,
                position: 56,
                nullables: [65535],
                transform: [transformers.dayET, unitTransformers.rain],
            },
            uv: { type: Type.UINT8, position: 43, nullables: nullables.uv },
            solarRadiation: {
                type: Type.UINT16,
                position: 44,
                nullables: nullables.solar,
                transform: [unitTransformers.solarRadiation],
            },
            graphPointers: {
                next10mWindSpeed: { type: Type.UINT8, position: 73 },
                next15mWindSpeed: { type: Type.UINT8, position: 74 },
                nextHourWindSpeed: { type: Type.UINT8, position: 75 },
                nextDailyWindSpeed: { type: Type.UINT8, position: 76 },
                nextMinuteRain: { type: Type.UINT8, position: 77 },
                nextMonthlyRain: { type: Type.UINT8, position: 80 },
                nextYearlyRain: { type: Type.UINT8, position: 81 },
                nextSeasonalRain: { type: Type.UINT8, position: 82 },
                nextRainStorm: { type: Type.UINT8, position: 78 },
                currentMinuteIndex: { type: Type.UINT8, position: 79 },
            },
        });
    }

    public parse(buffer: Buffer) {
        const result = super.parse(buffer) as Partial<LOOP2>;
        result.packageType = LOOPPackageType.LOOP2;
        return merge(new LOOP2(), result) as LOOP2;
    }
}
