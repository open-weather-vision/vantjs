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
        .read({
            type: Type.INT8,
            offset: 89,
        })
        .transform(transformers.forecastID);

    const pressTrendID = easy
        .read({
            type: Type.INT8,
            offset: 3,
        })
        .transform(transformers.pressTrendID);

    const windDirDeg = easy
        .read({
            type: Type.UINT16_LE,
            offset: 16,
        })
        .nullIfEquals(0);

    const result: LOOP1 = {
        tempExtra: easy
            .read({
                type: Type.TUPLE_7(
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8
                ),
                offset: 18,
            })
            .nullIfItemEquals(...nullables.tempExtra)
            .transformTupleItem(transformers.tempExtra)
            .transformTupleItem(unitTransformers.temperature)
            .end(),
        leafTemps: easy
            .read({
                type: Type.TUPLE_4(
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8
                ),
                offset: 29,
            })
            .nullIfItemEquals(...nullables.leafTemp)
            .transformTupleItem(transformers.leafTemp)
            .transformTupleItem(unitTransformers.leafTemperature)
            .end(),
        soilTemps: easy
            .read({
                type: Type.TUPLE_4(
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8
                ),
                offset: 25,
            })
            .nullIfItemEquals(...nullables.soilTemp)
            .transformTupleItem(transformers.soilTemp)
            .transformTupleItem(unitTransformers.soilTemperature)
            .end(),
        humExtra: easy
            .read({
                type: Type.TUPLE_7(
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8
                ),
                offset: 34,
            })
            .nullIfItemEquals(...nullables.humidity)
            .transformTupleItem(unitTransformers.humidity)
            .end(),
        rainMonth: easy
            .read({
                type: Type.UINT16_LE,
                offset: 52,
            })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rainYear: easy
            .read({
                type: Type.UINT16_LE,
                offset: 54,
            })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        etMonth: easy
            .read({
                type: Type.UINT16_LE,
                offset: 58,
            })
            .nullIfEquals(65535)
            .transform(transformers.monthET)
            .transform(unitTransformers.evoTranspiration)
            .end(),
        etYear: easy
            .read({
                type: Type.UINT16_LE,
                offset: 60,
            })
            .nullIfEquals(255)
            .transform(transformers.yearET)
            .transform(unitTransformers.evoTranspiration)
            .end(),
        soilMoistures: easy
            .read({
                type: Type.TUPLE_4(
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8
                ),
                offset: 62,
            })
            .nullIfItemEquals(255)
            .transformTupleItem(unitTransformers.soilMoisture)
            .end(),
        leafWetnesses: easy
            .read({
                type: Type.TUPLE_4(
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8,
                    Type.UINT8
                ),
                offset: 66,
            })
            .nullIfItemEquals(255)
            .end(),
        forecastID: forecastID.end(),
        forecast: forecastID.transform(transformers.forecast).end(),
        forecastRule:
            forecastID !== null
                ? easy
                      .read({
                          type: Type.UINT8,
                          offset: 90,
                      })
                      .end()
                : null,
        nextArchiveRecord: easy
            .read({
                type: Type.UINT16_LE,
                offset: 5,
            })
            .end(),
        alarms: {
            press: {
                falling: easy
                    .read({
                        type: Type.BIT(0),
                        offset: 70,
                    })
                    .end(),
                rising: easy
                    .read({
                        type: Type.BIT(1),
                        offset: 70,
                    })
                    .end(),
            },
            tempIn: {
                low: easy
                    .read({
                        type: Type.BIT(2),
                        offset: 70,
                    })
                    .end(),
                high: easy
                    .read({
                        type: Type.BIT(3),
                        offset: 70,
                    })
                    .end(),
            },
            humIn: {
                low: easy
                    .read({
                        type: Type.BIT(4),
                        offset: 70,
                    })
                    .end(),
                high: easy
                    .read({
                        type: Type.BIT(5),
                        offset: 70,
                    })
                    .end(),
            },
            time: easy
                .read({
                    type: Type.BIT(6),
                    offset: 70,
                })
                .end(),
            rain: {
                rate: easy
                    .read({
                        type: Type.BIT(0),
                        offset: 71,
                    })
                    .end(),
                quarter: easy
                    .read({
                        type: Type.BIT(1),
                        offset: 71,
                    })
                    .end(),
                daily: easy
                    .read({
                        type: Type.BIT(2),
                        offset: 71,
                    })
                    .end(),
                stormTotal: easy
                    .read({
                        type: Type.BIT(3),
                        offset: 71,
                    })
                    .end(),
            },
            etDay: easy
                .read({
                    type: Type.BIT(4),
                    offset: 71,
                })
                .end(),
            tempOut: {
                low: easy
                    .read({
                        type: Type.BIT(0),
                        offset: 72,
                    })
                    .end(),
                high: easy
                    .read({
                        type: Type.BIT(1),
                        offset: 72,
                    })
                    .end(),
            },
            wind: {
                speed: easy
                    .read({
                        type: Type.BIT(2),
                        offset: 72,
                    })
                    .end(),
                avg: easy
                    .read({
                        type: Type.BIT(3),
                        offset: 72,
                    })
                    .end(),
            },
            dew: {
                low: easy
                    .read({
                        type: Type.BIT(4),
                        offset: 72,
                    })
                    .end(),
                high: easy
                    .read({
                        type: Type.BIT(5),
                        offset: 72,
                    })
                    .end(),
            },
            heat: easy
                .read({
                    type: Type.BIT(6),
                    offset: 72,
                })
                .end(),
            chill: easy
                .read({
                    type: Type.BIT(7),
                    offset: 72,
                })
                .end(),
            thsw: easy
                .read({
                    type: Type.BIT(0),
                    offset: 73,
                })
                .end(),
            solarRadiation: easy
                .read({
                    type: Type.BIT(1),
                    offset: 73,
                })
                .end(),
            uv: {
                high: easy
                    .read({
                        type: Type.BIT(2),
                        offset: 73,
                    })
                    .end(),
                dose: easy
                    .read({
                        type: Type.BIT(3),
                        offset: 73,
                    })
                    .end(),
                enabledAndCleared: easy
                    .read({
                        type: Type.BIT(4),
                        offset: 73,
                    })
                    .end(),
            },
            humOut: {
                low: easy
                    .read({
                        type: Type.BIT(2),
                        offset: 74,
                    })
                    .end(),
                high: easy
                    .read({
                        type: Type.BIT(3),
                        offset: 74,
                    })
                    .end(),
            },
            tempExtra: easy
                .read({
                    offset: 75,
                    type: Type.TUPLE_7(
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        1
                    ),
                })
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            humExtra: easy
                .read({
                    offset: 75,
                    type: Type.TUPLE_7(
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        1
                    ),
                })
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            leafWetnesses: easy
                .read({
                    offset: 82,
                    type: Type.TUPLE_4(
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        Type.TUPLE_2(Type.BIT(0), Type.BIT(1)),
                        1
                    ),
                })
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            soilMoistures: easy
                .read({
                    offset: 82,
                    type: Type.TUPLE_4(
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        Type.TUPLE_2(Type.BIT(2), Type.BIT(3)),
                        1
                    ),
                })
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            leafTemps: easy
                .read({
                    offset: 82,
                    type: Type.TUPLE_4(
                        Type.TUPLE_2(Type.BIT(4), Type.BIT(5)),
                        Type.TUPLE_2(Type.BIT(4), Type.BIT(5)),
                        Type.TUPLE_2(Type.BIT(4), Type.BIT(5)),
                        Type.TUPLE_2(Type.BIT(4), Type.BIT(5)),
                        1
                    ),
                })
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
            soilTemps: easy
                .read({
                    offset: 82,
                    type: Type.TUPLE_4(
                        Type.TUPLE_2(Type.BIT(6), Type.BIT(7)),
                        Type.TUPLE_2(Type.BIT(6), Type.BIT(7)),
                        Type.TUPLE_2(Type.BIT(6), Type.BIT(7)),
                        Type.TUPLE_2(Type.BIT(6), Type.BIT(7)),
                        1
                    ),
                })
                .transformTupleItem((item) => ({ low: item[0], high: item[1] }))
                .end(),
        },
        transmitterBatteryStatus: easy
            .read({
                type: Type.UINT8,
                offset: 86,
            })
            .end(),
        consoleBatteryVoltage: easy
            .read({
                type: Type.UINT16_LE,
                offset: 87,
            })
            .transform((val) => (val * 300) / 512 / 100)
            .end(),
        sunrise: easy
            .read({
                type: Type.UINT16_LE,
                offset: 91,
            })
            .nullIfEquals(...nullables.time)
            .transform(transformers.time)
            .end(),
        sunset: easy
            .read({
                type: Type.UINT16_LE,
                offset: 93,
            })
            .nullIfEquals(...nullables.time)
            .transform(transformers.time)
            .end(),
        packageType: LOOPPackageType.LOOP1,
        press: easy
            .read({
                type: Type.UINT16_LE,
                offset: 7,
            })
            .nullIfEquals(...nullables.pressure)
            .transform(transformers.pressure)
            .transform(unitTransformers.pressure)
            .end(),
        pressTrendID: pressTrendID.end(),
        pressTrend: pressTrendID.transform(transformers.pressTrend).end(),
        tempOut: easy
            .read({
                type: Type.INT16_LE,
                offset: 12,
            })
            .nullIfEquals(...nullables.temperature)
            .transform(transformers.temperature)
            .transform(unitTransformers.temperature)
            .end(),
        tempIn: easy
            .read({
                type: Type.INT16_LE,
                offset: 9,
            })
            .nullIfEquals(...nullables.temperature)
            .transform(transformers.temperature)
            .transform(unitTransformers.temperature)
            .end(),
        humIn: easy
            .read({
                type: Type.UINT8,
                offset: 11,
            })
            .nullIfEquals(...nullables.humidity)
            .transform(unitTransformers.humidity)
            .end(),
        humOut: easy
            .read({
                type: Type.UINT8,
                offset: 33,
            })
            .nullIfEquals(...nullables.humidity)
            .transform(unitTransformers.humidity)
            .end(),
        wind: easy
            .read({
                type: Type.UINT8,
                offset: 14,
            })
            .transform(unitTransformers.wind)
            .end(),
        windAvg10m: easy
            .read({
                type: Type.UINT8,
                offset: 15,
            })
            .transform(unitTransformers.wind)
            .end(),
        windDirDeg: windDirDeg.end(),
        windDir: windDirDeg.transform(transformers.windDir).end(),
        rainRate: easy
            .read({
                type: Type.UINT16_LE,
                offset: 41,
            })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        rainDay: easy
            .read({
                type: Type.UINT16_LE,
                offset: 50,
            })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        stormStartDate: easy
            .read({
                type: Type.INT16_LE,
                offset: 48,
            })
            .nullIfEquals(-1, 0xffff)
            .transform(transformers.stormStartDate)
            .end(),
        stormRain: easy
            .read({
                type: Type.UINT16_LE,
                offset: 46,
            })
            .transform(rainClicksToInchTransformer)
            .transform(unitTransformers.rain)
            .end(),
        etDay: easy
            .read({
                type: Type.UINT16_LE,
                offset: 56,
            })
            .nullIfEquals(65535)
            .transform(transformers.dayET)
            .transform(unitTransformers.evoTranspiration)
            .end(),
        uv: easy
            .read({
                type: Type.UINT8,
                offset: 43,
            })
            .nullIfEquals(255)
            .transform(transformers.uv)
            .end(),
        solarRadiation: easy
            .read({
                type: Type.INT16_LE,
                offset: 44,
            })
            .nullIfEquals(...nullables.solar)
            .transform(unitTransformers.solarRadiation)
            .end(),
        time: new Date(),
    };

    if (result.stormStartDate === null) result.stormRain = null;

    return result;
}
