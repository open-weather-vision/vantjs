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
        .read(Type.INT8, 3)
        .transform(transformers.pressTrendID);

    const pressReductionMethodID = easy
        .read(Type.UINT8, 60)
        .transform(transformers.pressReductionMethodID);

    const windDirDeg = easy.read(Type.UINT16_LE, 16).nullIfEquals(0);

    const windGustDirDeg = easy.read(Type.UINT16_LE, 24).nullIfEquals(0);

    const result: LOOP2 = {
        press: easy
            .read(Type.UINT16_LE, 7)
            .nullIfEquals(...nullables.pressure)
            .transform(transformers.pressure)
            .transform(unitTransformers.pressure)
            .end(),
        pressRaw: easy
            .read(Type.INT16_LE, 65)
            .transform(transformers.pressure)
            .transform(unitTransformers.pressure)
            .end(),
        pressAbs: easy
            .read(Type.INT16_LE, 67)
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
            .read(Type.INT16_LE, 61)
            .transform((val) => val / 1000)
            .transform(unitTransformers.pressure)
            .end(),
        pressCalibrationOffset: easy
            .read(Type.INT16_LE, 63)
            .transform((val) => val / 1000)
            .transform(unitTransformers.pressure)
            .end(),
        altimeter: easy
            .read(Type.INT16_LE, 69)
            .transform((val) => val / 1000)
            .transform(unitTransformers.pressure)
            .end(),
        heat: easy
            .read(Type.INT16_LE, 35)
            .nullIfEquals(255)
            .transform(unitTransformers.temperature)
            .end(),
        dew: easy
            .read(Type.INT16_LE, 30)
            .nullIfEquals(255)
            .transform(unitTransformers.temperature)
            .end(),
        tempIn: easy
            .read(Type.INT16_LE, 9)
            .nullIfEquals(...nullables.temperature)
            .transform(transformers.temperature)
            .transform(unitTransformers.temperature)
            .end(),
        tempOut: easy
            .read(Type.INT16_LE, 12)
            .nullIfEquals(...nullables.temperature)
            .transform(transformers.temperature)
            .transform(unitTransformers.temperature)
            .end(),
        humIn: easy
            .read(Type.UINT8, 11)
            .nullIfEquals(...nullables.humidity)
            .transform(unitTransformers.humidity)
            .end(),
        humOut: easy
            .read(Type.UINT8, 33)
            .nullIfEquals(...nullables.humidity)
            .transform(unitTransformers.humidity)
            .end(),
        wind: easy.read(Type.UINT8, 14).transform(unitTransformers.wind).end(),
        windAvg2m: easy
            .read(Type.UINT16_LE, 20)
            .transform((val) => (val !== null ? val / 10 : val))
            .transform(unitTransformers.wind)
            .end(),
        windAvg10m: easy
            .read(Type.UINT16_LE, 18)
            .transform((val) => (val !== null ? val / 10 : val))
            .transform(unitTransformers.wind)
            .end(),
        windDirDeg: windDirDeg.end(),
        windDir: windDirDeg.transform(transformers.windDir).end(),
        windGustDirDeg: windGustDirDeg.end(),
        windGustDir: windGustDirDeg.transform(transformers.windDir).end(),
        windGust: easy
            .read(Type.UINT16_LE, 22)
            .transform((val) => (val !== null ? val / 10 : val))
            .transform(unitTransformers.wind)
            .end(),
        chill: easy
            .read(Type.INT16_LE, 37)
            .nullIfEquals(255)
            .transform(unitTransformers.temperature)
            .end(),
        thsw: easy
            .read(Type.INT16_LE, 39)
            .nullIfEquals(255)
            .transform(unitTransformers.temperature)
            .end(),
        rainRate: easy
            .read(Type.UINT16_LE, 41)
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        stormStartDate: easy
            .read(Type.INT16_LE, 48)
            .nullIfEquals(-1, 0xffff)
            .transform(transformers.stormStartDate)
            .end(),
        stormRain: easy
            .read(Type.UINT16_LE, 46)
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rainDay: easy
            .read(Type.UINT16_LE, 50)
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rain15m: easy
            .read(Type.UINT16_LE, 52)
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rain1h: easy
            .read(Type.UINT16_LE, 54)
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rain24h: easy
            .read(Type.UINT16_LE, 58)
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        etDay: easy
            .read(Type.UINT16_LE, 56)
            .nullIfEquals(65535)
            .transform(transformers.dayET)
            .transform(unitTransformers.evoTranspiration)
            .end(),
        uv: easy
            .read(Type.UINT8, 43)
            .nullIfEquals(...nullables.uv)
            .end(),
        solarRadiation: easy
            .read(Type.UINT16_LE, 44)
            .nullIfEquals(...nullables.solar)
            .transform(unitTransformers.solarRadiation)
            .end(),
        graphPointers: {
            next10mWindSpeed: easy.read(Type.UINT8, 73).end(),
            next15mWindSpeed: easy.read(Type.UINT8, 74).end(),
            nextHourWindSpeed: easy.read(Type.UINT8, 75).end(),
            nextDailyWindSpeed: easy.read(Type.UINT8, 76).end(),
            nextMinuteRain: easy.read(Type.UINT8, 77).end(),
            nextMonthlyRain: easy.read(Type.UINT8, 80).end(),
            nextYearlyRain: easy.read(Type.UINT8, 81).end(),
            nextSeasonalRain: easy.read(Type.UINT8, 82).end(),
            nextRainStorm: easy.read(Type.UINT8, 78).end(),
            currentMinuteIndex: easy.read(Type.UINT8, 79).end(),
        },
        packageType: LOOPPackageType.LOOP2,
        time: new Date(),
    };

    if (result.stormStartDate === null) result.stormRain = null;

    return result;
}
