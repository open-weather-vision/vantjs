import { LOOP2, LOOPPackageType } from "vant-environment/structures";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/createUnitTransformers";
import { EasyBuffer, Type } from "@harrydehix/easy-buffer";

export default function (
    buffer: Buffer,
    rainClicksToInchTransformer: (rainClicks: number) => number,
    unitTransformers: UnitTransformers
): LOOP2 {
    const easy = new EasyBuffer(buffer);

    const pressTrendID = easy
        .read({
            type: Type.INT8,
            offset: 3,
        })
        .transform(transformers.pressTrendID);

    const pressReductionMethodID = easy
        .read({
            type: Type.UINT8,
            offset: 60,
        })
        .transform(transformers.pressReductionMethodID);

    const windDirDeg = easy
        .read({ type: Type.UINT16_LE, offset: 16 })
        .nullIfEquals(0);

    const windGustDirDeg = easy
        .read({ type: Type.UINT16_LE, offset: 24 })
        .nullIfEquals(0);

    const result: LOOP2 = {
        press: easy
            .read({
                type: Type.UINT16_LE,
                offset: 7,
            })
            .nullIfEquals(...nullables.pressure)
            .transform(transformers.pressure)
            .transform(unitTransformers.pressure)
            .end(),
        pressRaw: easy
            .read({
                type: Type.INT16_LE,
                offset: 65,
            })
            .transform(transformers.pressure)
            .transform(unitTransformers.pressure)
            .end(),
        pressAbs: easy
            .read({
                type: Type.INT16_LE,
                offset: 67,
            })
            .transform(transformers.pressure)
            .transform(unitTransformers.pressure)
            .end(),
        pressTrendID: pressTrendID.end(),
        pressTrend: pressTrendID.transform(transformers.pressTrend).end(),
        pressReductionMethodID: pressReductionMethodID.end(),
        pressReductionMethod: pressReductionMethodID
            .transform(transformers.pressReductionMethod)
            .end(),
        pressUserOffset: easy
            .read({ type: Type.INT16_LE, offset: 61 })
            .transform((val) => val / 1000)
            .transform(unitTransformers.pressure)
            .end(),
        pressCalibrationOffset: easy
            .read({ type: Type.INT16_LE, offset: 63 })
            .transform((val) => val / 1000)
            .transform(unitTransformers.pressure)
            .end(),
        altimeter: easy
            .read({ type: Type.INT16_LE, offset: 69 })
            .transform((val) => val / 1000)
            .transform(unitTransformers.elevation)
            .end(),
        heat: easy
            .read({ type: Type.INT16_LE, offset: 35 })
            .nullIfEquals(255)
            .transform(unitTransformers.temperature)
            .end(),
        dew: easy
            .read({ type: Type.INT16_LE, offset: 30 })
            .nullIfEquals(255)
            .transform(unitTransformers.temperature)
            .end(),
        tempIn: easy
            .read({ type: Type.INT16_LE, offset: 9 })
            .nullIfEquals(...nullables.temperature)
            .transform(transformers.temperature)
            .transform(unitTransformers.temperature)
            .end(),
        tempOut: easy
            .read({ type: Type.INT16_LE, offset: 12 })
            .nullIfEquals(...nullables.temperature)
            .transform(transformers.temperature)
            .transform(unitTransformers.temperature)
            .end(),
        humIn: easy
            .read({ type: Type.UINT8, offset: 11 })
            .nullIfEquals(...nullables.humidity)
            .transform(unitTransformers.humidity)
            .end(),
        humOut: easy
            .read({ type: Type.UINT8, offset: 33 })
            .nullIfEquals(...nullables.humidity)
            .transform(unitTransformers.humidity)
            .end(),
        wind: easy
            .read({ type: Type.UINT8, offset: 14 })
            .transform(unitTransformers.wind)
            .end(),
        windAvg2m: easy
            .read({ type: Type.UINT16_LE, offset: 20 })
            .transform((val) => (val !== null ? val / 10 : val))
            .transform(unitTransformers.wind)
            .end(),
        windAvg10m: easy
            .read({ type: Type.UINT16_LE, offset: 18 })
            .transform((val) => (val !== null ? val / 10 : val))
            .transform(unitTransformers.wind)
            .end(),
        windDirDeg: windDirDeg.end(),
        windDir: windDirDeg.transform(transformers.windDir).end(),
        windGustDirDeg: windGustDirDeg.end(),
        windGustDir: windGustDirDeg.transform(transformers.windDir).end(),
        windGust: easy
            .read({ type: Type.UINT16_LE, offset: 22 })
            .transform((val) => (val !== null ? val / 10 : val))
            .transform(unitTransformers.wind)
            .end(),
        chill: easy
            .read({ type: Type.INT16_LE, offset: 37 })
            .nullIfEquals(255)
            .transform(unitTransformers.temperature)
            .end(),
        thsw: easy
            .read({ type: Type.INT16_LE, offset: 39 })
            .nullIfEquals(255)
            .transform(unitTransformers.temperature)
            .end(),
        rainRate: easy
            .read({ type: Type.UINT16_LE, offset: 41 })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        stormStartDate: easy
            .read({ type: Type.INT16_LE, offset: 48 })
            .nullIfEquals(-1, 0xffff)
            .transform(transformers.stormStartDate)
            .end(),
        stormRain: easy
            .read({ type: Type.UINT16_LE, offset: 46 })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rainDay: easy
            .read({ type: Type.UINT16_LE, offset: 50 })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rain15m: easy
            .read({ type: Type.UINT16_LE, offset: 52 })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rain1h: easy
            .read({ type: Type.UINT16_LE, offset: 54 })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rain24h: easy
            .read({ type: Type.UINT16_LE, offset: 58 })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        etDay: easy
            .read({ type: Type.UINT16_LE, offset: 56 })
            .nullIfEquals(65535)
            .transform(transformers.dayET)
            .transform(unitTransformers.evoTranspiration)
            .end(),
        uv: easy
            .read({ type: Type.UINT8, offset: 43 })
            .nullIfEquals(...nullables.uv)
            .end(),
        solarRadiation: easy
            .read({ type: Type.UINT16_LE, offset: 44 })
            .nullIfEquals(...nullables.solar)
            .transform(unitTransformers.solarRadiation)
            .end(),
        graphPointers: {
            next10mWindSpeed: easy.read({ type: Type.UINT8, offset: 73 }).end(),
            next15mWindSpeed: easy.read({ type: Type.UINT8, offset: 74 }).end(),
            nextHourWindSpeed: easy
                .read({ type: Type.UINT8, offset: 75 })
                .end(),
            nextDailyWindSpeed: easy
                .read({ type: Type.UINT8, offset: 76 })
                .end(),
            nextMinuteRain: easy.read({ type: Type.UINT8, offset: 77 }).end(),
            nextMonthlyRain: easy.read({ type: Type.UINT8, offset: 80 }).end(),
            nextYearlyRain: easy.read({ type: Type.UINT8, offset: 81 }).end(),
            nextSeasonalRain: easy.read({ type: Type.UINT8, offset: 82 }).end(),
            nextRainStorm: easy.read({ type: Type.UINT8, offset: 78 }).end(),
            currentMinuteIndex: easy
                .read({ type: Type.UINT8, offset: 79 })
                .end(),
        },
        packageType: LOOPPackageType.LOOP2,
        time: new Date(),
    };

    if (result.stormStartDate === null) result.stormRain = null;

    return result;
}
