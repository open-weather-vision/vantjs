import merge from "lodash.merge";
import { LOOP1, LOOPPackageType } from "vant-environment/structures";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/createUnitTransformers";
import { EasyBuffer, Type } from "@harrydehix/easy-buffer";

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
    const easy = new EasyBuffer(buffer);

    const forecastID = easy
        .read(Type.INT8, 89)
        .transform(transformers.forecastID);

    const pressTrendID = easy
        .read(Type.INT8, 3)
        .transform(transformers.pressTrendID);

    const windDirDeg = easy.read(Type.UINT16_LE, 16).nullIfEquals(0);

    const result: LOOP1 = {
        tempExtra: easy
            .read(
                Type.TUPLE_7(
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8
                ),
                18
            )
            .nullIfItemEquals(...nullables.tempExtra)
            .transformTupleItem(transformers.tempExtra)
            .transformTupleItem(unitTransformers.temperature)
            .end(),
        leafTemps: easy
            .read(
                Type.TUPLE_4(Type.UINT8, Type.UINT8, Type.UINT8, Type.UINT8),
                29
            )
            .nullIfItemEquals(...nullables.leafTemp)
            .transformTupleItem(transformers.leafTemp)
            .transformTupleItem(unitTransformers.leafTemperature)
            .end(),
        soilTemps: easy
            .read(
                Type.TUPLE_4(Type.UINT8, Type.UINT8, Type.UINT8, Type.UINT8),
                25
            )
            .nullIfItemEquals(...nullables.soilTemp)
            .transformTupleItem(transformers.soilTemp)
            .transformTupleItem(unitTransformers.soilTemperature)
            .end(),
        humExtra: easy
            .read(
                Type.TUPLE_7(
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8
                ),
                34
            )
            .nullIfItemEquals(...nullables.humidity)
            .transformTupleItem(unitTransformers.humidity)
            .end(),
        rainMonth: easy
            .read(Type.UINT16_LE, 52)
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rainYear: easy
            .read(Type.UINT16_LE, 54)
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        etMonth: easy
            .read(Type.UINT16_LE, 58)
            .nullIfEquals(65535)
            .transform(transformers.monthET)
            .transform(unitTransformers.evoTranspiration)
            .end(),
        etYear: easy
            .read(Type.UINT16_LE, 60)
            .nullIfEquals(255)
            .transform(transformers.yearET)
            .transform(unitTransformers.evoTranspiration)
            .end(),
        soilMoistures: easy
            .read(
                Type.TUPLE_4(Type.UINT8, Type.UINT8, Type.UINT8, Type.UINT8),
                62
            )
            .nullIfItemEquals(255)
            .transformTupleItem(unitTransformers.soilMoisture)
            .end(),
        leafWetnesses: easy
            .read(
                Type.TUPLE_4(Type.UINT8, Type.UINT8, Type.UINT8, Type.UINT8),
                66
            )
            .nullIfItemEquals(255)
            .end(),
        forecastID: forecastID.end(),
        forecast: forecastID.transform(transformers.forecast).end(),
        forecastRule:
            forecastID !== null ? easy.read(Type.UINT8, 90).end() : null,
        nextArchiveRecord: easy.read(Type.UINT16_LE, 5).end(),
        alarms: {
            press: {
                falling: easy.read(Type.BIT(0), 70).end(),
                rising: easy.read(Type.BIT(1), 70).end(),
            },
            tempIn: {
                low: easy.read(Type.BIT(2), 70).end(),
                high: easy.read(Type.BIT(3), 70).end(),
            },
            humIn: {
                low: easy.read(Type.BIT(4), 70).end(),
                high: easy.read(Type.BIT(5), 70).end(),
            },
            time: easy.read(Type.BIT(6), 70).end(),
            rain: {
                rate: easy.read(Type.BIT(0), 71).end(),
                quarter: easy.read(Type.BIT(1), 71).end(),
                daily: easy.read(Type.BIT(2), 71).end(),
                stormTotal: easy.read(Type.BIT(3), 71).end(),
            },
            etDay: easy.read(Type.BIT(4), 71).end(),
            tempOut: {
                low: easy.read(Type.BIT(0), 72).end(),
                high: easy.read(Type.BIT(1), 72).end(),
            },
            wind: {
                speed: easy.read(Type.BIT(2), 72).end(),
                avg: easy.read(Type.BIT(3), 72).end(),
            },
            dew: {
                low: easy.read(Type.BIT(4), 72).end(),
                high: easy.read(Type.BIT(5), 72).end(),
            },
            heat: easy.read(Type.BIT(6), 72).end(),
            chill: easy.read(Type.BIT(7), 72).end(),
            thsw: easy.read(Type.BIT(0), 73).end(),
            solarRadiation: easy.read(Type.BIT(1), 73).end(),
            uv: {
                high: easy.read(Type.BIT(2), 73).end(),
                dose: easy.read(Type.BIT(3), 73).end(),
                enabledAndCleared: easy.read(Type.BIT(4), 73).end(),
            },
            humOut: {
                low: easy.read(Type.BIT(2), 74).end(),
                high: easy.read(Type.BIT(3), 74).end(),
            },
            tempExtra: easy
                .read(
                    Type.TUPLE_7(
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        1
                    ),
                    75
                )
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            humExtra: easy
                .read(
                    Type.TUPLE_7(
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        1
                    ),
                    75
                )
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            leafWetnesses: easy
                .read(
                    Type.TUPLE_4(
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        1
                    ),
                    82
                )
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            soilMoistures: easy
                .read(
                    Type.TUPLE_4(
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        1
                    ),
                    82
                )
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            leafTemps: easy
                .read(
                    Type.TUPLE_4(
                        Type.TUPLE_2(Type.BIT(4), Type.BIT(5)),
                        Type.TUPLE_2(Type.BIT(4), Type.BIT(5)),
                        Type.TUPLE_2(Type.BIT(4), Type.BIT(5)),
                        Type.TUPLE_2(Type.BIT(4), Type.BIT(5)),
                        1
                    ),
                    82
                )
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            soilTemps: easy
                .read(
                    Type.TUPLE_4(
                        Type.TUPLE_2(Type.BIT(6), Type.BIT(7)),
                        Type.TUPLE_2(Type.BIT(6), Type.BIT(7)),
                        Type.TUPLE_2(Type.BIT(6), Type.BIT(7)),
                        Type.TUPLE_2(Type.BIT(6), Type.BIT(7)),
                        1
                    ),
                    82
                )
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
        },
        transmitterBatteryStatus: easy.read(Type.UINT8, 86).end(),
        consoleBatteryVoltage: easy
            .read(Type.UINT16_LE, 87)
            .transform((val) => (val * 300) / 512 / 100)
            .end(),
        sunrise: easy
            .read(Type.UINT16_LE, 91)
            .nullIfEquals(...nullables.time)
            .transform(transformers.time)
            .end(),
        sunset: easy
            .read(Type.UINT16_LE, 93)
            .nullIfEquals(...nullables.time)
            .transform(transformers.time)
            .end(),
        packageType: LOOPPackageType.LOOP1,
        press: easy
            .read(Type.UINT16_LE, 7)
            .nullIfEquals(...nullables.pressure)
            .transform(transformers.pressure)
            .transform(unitTransformers.pressure)
            .end(),
        pressTrendID: pressTrendID.end(),
        pressTrend: pressTrendID.transform(transformers.pressTrend).end(),
        tempOut: easy
            .read(Type.INT16_LE, 12)
            .nullIfEquals(...nullables.temperature)
            .transform(transformers.temperature)
            .transform(unitTransformers.temperature)
            .end(),
        tempIn: easy
            .read(Type.INT16_LE, 9)
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
        windAvg10m: easy
            .read(Type.UINT8, 15)
            .transform(unitTransformers.wind)
            .end(),
        windDirDeg: windDirDeg.end(),
        windDir: windDirDeg.transform(transformers.windDir).end(),
        rainRate: easy
            .read(Type.UINT16_LE, 41)
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rainDay: easy
            .read(Type.UINT16_LE, 50)
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
        etDay: easy
            .read(Type.UINT16_LE, 56)
            .nullIfEquals(65535)
            .transform(transformers.dayET)
            .transform(unitTransformers.evoTranspiration)
            .end(),
        uv: easy
            .read(Type.UINT8, 43)
            .nullIfEquals(255)
            .transform(transformers.uv)
            .end(),
        solarRadiation: easy
            .read(Type.INT16_LE, 44)
            .nullIfEquals(...nullables.solar)
            .transform(unitTransformers.solarRadiation)
            .end(),
        time: new Date(),
    };

    if (result.stormStartDate === null) result.stormRain = null;

    return result;
}
