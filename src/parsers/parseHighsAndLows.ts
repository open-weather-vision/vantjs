import { HighsAndLows } from "vant-environment/structures";
import nullables from "./reusables/nullables";
import transformers from "./reusables/transformers";
import { UnitTransformers } from "./units/createUnitTransformers";
import { EasyBuffer, Type } from "@harrydehix/easy-buffer";

export default function (
    buffer: Buffer,
    rainClicksToInchTransformer: (rainClicks: number) => number,
    unitTransformers: UnitTransformers
): HighsAndLows {
    const easy = new EasyBuffer(buffer);

    const result: HighsAndLows = {
        press: {
            day: {
                low: easy
                    .read({ type: Type.UINT16_LE, offset: 0 })
                    .nullIfEquals(...nullables.pressure)
                    .transform(transformers.pressure)
                    .transform(unitTransformers.pressure)
                    .end(),
                high: easy
                    .read({ type: Type.UINT16_LE, offset: 2 })
                    .nullIfEquals(...nullables.pressure)
                    .transform(transformers.pressure)
                    .transform(unitTransformers.pressure)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 12,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 14,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({ type: Type.UINT16_LE, offset: 4 })
                    .nullIfEquals(...nullables.pressure)
                    .transform(transformers.pressure)
                    .transform(unitTransformers.pressure)
                    .end(),
                high: easy
                    .read({ type: Type.UINT16_LE, offset: 6 })
                    .nullIfEquals(...nullables.pressure)
                    .transform(transformers.pressure)
                    .transform(unitTransformers.pressure)
                    .end(),
            },
            year: {
                low: easy
                    .read({ type: Type.UINT16_LE, offset: 8 })
                    .nullIfEquals(...nullables.pressure)
                    .transform(transformers.pressure)
                    .transform(unitTransformers.pressure)
                    .end(),
                high: easy
                    .read({ type: Type.UINT16_LE, offset: 10 })
                    .nullIfEquals(...nullables.pressure)
                    .transform(transformers.pressure)
                    .transform(unitTransformers.pressure)
                    .end(),
            },
        },
        wind: {
            day: easy
                .read({ type: Type.UINT8, offset: 16 })
                .transform(unitTransformers.wind)
                .end(),
            dayTime: easy
                .read({ type: Type.UINT16_LE, offset: 17 })
                .nullIfEquals(...nullables.time)
                .transform(transformers.time)
                .end(),
            month: easy
                .read({ type: Type.UINT8, offset: 19 })
                .transform(unitTransformers.wind)
                .end(),
            year: easy
                .read({ type: Type.UINT8, offset: 20 })
                .transform(unitTransformers.wind)
                .end(),
        },
        tempIn: {
            day: {
                low: easy
                    .read({ type: Type.INT16_LE, offset: 23 })
                    .nullIfEquals(...nullables.tempLow)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({ type: Type.INT16_LE, offset: 21 })
                    .nullIfEquals(...nullables.tempHigh)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 27,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 25,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 29,
                    })
                    .nullIfEquals(...nullables.tempLow)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 31,
                    })
                    .nullIfEquals(...nullables.tempHigh)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 33,
                    })
                    .nullIfEquals(...nullables.tempLow)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 35,
                    })
                    .nullIfEquals(...nullables.tempHigh)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
            },
        },
        humIn: {
            day: {
                low: easy
                    .read({
                        type: Type.UINT8,
                        offset: 38,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
                high: easy
                    .read({
                        type: Type.UINT8,
                        offset: 37,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 41,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 39,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.UINT8,
                        offset: 44,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
                high: easy
                    .read({
                        type: Type.UINT8,
                        offset: 43,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.UINT8,
                        offset: 46,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
                high: easy
                    .read({
                        type: Type.UINT8,
                        offset: 45,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
            },
        },
        tempOut: {
            day: {
                low: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 47,
                    })
                    .nullIfEquals(...nullables.tempLow)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 49,
                    })
                    .nullIfEquals(...nullables.tempHigh)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 51,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 53,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 57,
                    })
                    .nullIfEquals(...nullables.tempLow)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 55,
                    })
                    .nullIfEquals(...nullables.tempHigh)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 61,
                    })
                    .nullIfEquals(...nullables.tempLow)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 59,
                    })
                    .nullIfEquals(...nullables.tempHigh)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
            },
        },
        dew: {
            day: {
                low: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 63,
                    })
                    .nullIfEquals(...nullables.tempLow)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 65,
                    })
                    .nullIfEquals(...nullables.tempHigh)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 67,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 69,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 73,
                    })
                    .nullIfEquals(...nullables.tempLow)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 71,
                    })
                    .nullIfEquals(...nullables.tempHigh)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 77,
                    })
                    .nullIfEquals(...nullables.tempLow)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.INT16_LE,
                        offset: 75,
                    })
                    .nullIfEquals(...nullables.tempHigh)
                    .transform(transformers.temperature)
                    .transform(unitTransformers.temperature)
                    .end(),
            },
        },
        chill: {
            day: easy
                .read({
                    type: Type.INT16_LE,
                    offset: 79,
                })
                .nullIfEquals(...nullables.chill)
                .transform(unitTransformers.temperature)
                .end(),
            dayTime: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 81,
                })
                .nullIfEquals(...nullables.time)
                .transform(transformers.time)
                .end(),
            month: easy
                .read({
                    type: Type.INT16_LE,
                    offset: 83,
                })
                .nullIfEquals(...nullables.chill)
                .transform(unitTransformers.temperature)
                .end(),
            year: easy
                .read({
                    type: Type.INT16_LE,
                    offset: 85,
                })
                .nullIfEquals(...nullables.chill)
                .transform(unitTransformers.temperature)
                .end(),
        },
        heat: {
            day: easy
                .read({
                    type: Type.INT16_LE,
                    offset: 87,
                })
                .nullIfEquals(...nullables.heat)
                .transform(unitTransformers.temperature)
                .end(),
            dayTime: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 89,
                })
                .nullIfEquals(...nullables.time)
                .transform(transformers.time)
                .end(),
            month: easy
                .read({
                    type: Type.INT16_LE,
                    offset: 91,
                })
                .nullIfEquals(...nullables.heat)
                .transform(unitTransformers.temperature)
                .end(),
            year: easy
                .read({
                    type: Type.INT16_LE,
                    offset: 93,
                })
                .nullIfEquals(...nullables.heat)
                .transform(unitTransformers.temperature)
                .end(),
        },
        thsw: {
            day: easy
                .read({
                    type: Type.INT16_LE,
                    offset: 95,
                })
                .nullIfEquals(...nullables.thsw)
                .transform(unitTransformers.temperature)
                .end(),
            dayTime: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 97,
                })
                .nullIfEquals(...nullables.time)
                .transform(transformers.time)
                .end(),
            month: easy
                .read({
                    type: Type.INT16_LE,
                    offset: 99,
                })
                .nullIfEquals(...nullables.thsw)
                .transform(unitTransformers.temperature)
                .end(),
            year: easy
                .read({
                    type: Type.INT16_LE,
                    offset: 101,
                })
                .nullIfEquals(...nullables.thsw)
                .transform(unitTransformers.temperature)
                .end(),
        },
        solarRadiation: {
            month: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 107,
                })
                .nullIfEquals(...nullables.solar)
                .transform(unitTransformers.solarRadiation)
                .end(),
            year: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 109,
                })
                .nullIfEquals(...nullables.solar)
                .transform(unitTransformers.solarRadiation)
                .end(),
            day: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 103,
                })
                .nullIfEquals(...nullables.solar)
                .transform(unitTransformers.solarRadiation)
                .end(),
            dayTime: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 105,
                })
                .nullIfEquals(...nullables.time)
                .transform(transformers.time)
                .end(),
        },
        uv: {
            month: easy
                .read({
                    type: Type.UINT8,
                    offset: 114,
                })
                .nullIfEquals(...nullables.uv)
                .transform(transformers.uv)
                .end(),
            year: easy
                .read({
                    type: Type.UINT8,
                    offset: 115,
                })
                .nullIfEquals(...nullables.uv)
                .transform(transformers.uv)
                .end(),
            day: easy
                .read({
                    type: Type.UINT8,
                    offset: 111,
                })
                .nullIfEquals(...nullables.uv)
                .transform(transformers.uv)
                .end(),
            dayTime: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 112,
                })
                .nullIfEquals(...nullables.time)
                .transform(transformers.time)
                .end(),
        },
        rainRate: {
            hour: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 120,
                })
                .transform(rainClicksToInchTransformer)
                .transform(unitTransformers.rain)
                .end(),
            day: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 116,
                })
                .transform(rainClicksToInchTransformer)
                .transform(unitTransformers.rain)
                .end(),
            dayTime: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 118,
                })
                .nullIfEquals(...nullables.time)
                .transform(transformers.time)
                .end(),
            month: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 122,
                })
                .transform(rainClicksToInchTransformer)
                .transform(unitTransformers.rain)
                .end(),
            year: easy
                .read({
                    type: Type.UINT16_LE,
                    offset: 124,
                })
                .transform(rainClicksToInchTransformer)
                .transform(unitTransformers.rain)
                .end(),
        },
        tempExtra: {
            day: {
                low: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 126,
                    })
                    .nullIfItemEquals(...nullables.tempExtra)
                    .transformTupleItem(transformers.tempExtra)
                    .transformTupleItem(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 141,
                    })
                    .nullIfItemEquals(...nullables.tempExtra)
                    .transformTupleItem(transformers.tempExtra)
                    .transformTupleItem(unitTransformers.temperature)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 156,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 186,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 231,
                    })
                    .nullIfItemEquals(...nullables.tempExtra)
                    .transformTupleItem(transformers.tempExtra)
                    .transformTupleItem(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 216,
                    })
                    .nullIfItemEquals(...nullables.tempExtra)
                    .transformTupleItem(transformers.tempExtra)
                    .transformTupleItem(unitTransformers.temperature)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 261,
                    })
                    .nullIfItemEquals(...nullables.tempExtra)
                    .transformTupleItem(transformers.tempExtra)
                    .transformTupleItem(unitTransformers.temperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 246,
                    })
                    .nullIfItemEquals(...nullables.tempExtra)
                    .transformTupleItem(transformers.tempExtra)
                    .transformTupleItem(unitTransformers.temperature)
                    .end(),
            },
        },
        soilTemps: {
            day: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 133,
                    })
                    .nullIfItemEquals(...nullables.soilTemp)
                    .transformTupleItem(transformers.soilTemp)
                    .transformTupleItem(unitTransformers.soilTemperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 148,
                    })
                    .nullIfItemEquals(...nullables.soilTemp)
                    .transformTupleItem(transformers.soilTemp)
                    .transformTupleItem(unitTransformers.soilTemperature)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 170,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 200,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 238,
                    })
                    .nullIfItemEquals(...nullables.soilTemp)
                    .transformTupleItem(transformers.soilTemp)
                    .transformTupleItem(unitTransformers.soilTemperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 223,
                    })
                    .nullIfItemEquals(...nullables.soilTemp)
                    .transformTupleItem(transformers.soilTemp)
                    .transformTupleItem(unitTransformers.soilTemperature)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 268,
                    })
                    .nullIfItemEquals(...nullables.soilTemp)
                    .transformTupleItem(transformers.soilTemp)
                    .transformTupleItem(unitTransformers.soilTemperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 253,
                    })
                    .nullIfItemEquals(...nullables.soilTemp)
                    .transformTupleItem(transformers.soilTemp)
                    .transformTupleItem(unitTransformers.soilTemperature)
                    .end(),
            },
        },
        leafTemps: {
            day: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 137,
                    })
            
                    .nullIfItemEquals(...nullables.leafTemp)
                    .transformTupleItem(transformers.leafTemp)
                    .transformTupleItem(unitTransformers.leafTemperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 152,
                    })
                    .nullIfItemEquals(...nullables.leafTemp)
                    .transformTupleItem(transformers.leafTemp)
                    .transformTupleItem(unitTransformers.leafTemperature)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 178,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 208,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 242,
                    })
                    .nullIfItemEquals(...nullables.leafTemp)
                    .transformTupleItem(transformers.leafTemp)
                    .transformTupleItem(unitTransformers.leafTemperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 227,
                    })
                    .nullIfItemEquals(...nullables.leafTemp)
                    .transformTupleItem(transformers.leafTemp)
                    .transformTupleItem(unitTransformers.leafTemperature)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 272,
                    })
                    .nullIfItemEquals(...nullables.leafTemp)
                    .transformTupleItem(transformers.leafTemp)
                    .transformTupleItem(unitTransformers.leafTemperature)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 257,
                    })
                    .nullIfItemEquals(...nullables.leafTemp)
                    .transformTupleItem(transformers.leafTemp)
                    .transformTupleItem(unitTransformers.leafTemperature)
                    .end(),
            },
        },
        humExtra: {
            day: {
                low: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 277,
                    })
                    .nullIfItemEquals(...nullables.humidity)
                    .transformTupleItem(unitTransformers.humidity)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 285,
                    })
                    .nullIfItemEquals(...nullables.humidity)
                    .transformTupleItem(unitTransformers.humidity)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 293,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 309,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 333,
                    })
                    .nullIfItemEquals(...nullables.humidity)
                    .transformTupleItem(unitTransformers.humidity)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 325,
                    })
                    .nullIfItemEquals(...nullables.humidity)
                    .transformTupleItem(unitTransformers.humidity)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 349,
                    })
                    .nullIfItemEquals(...nullables.humidity)
                    .transformTupleItem(unitTransformers.humidity)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_7(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 341,
                    })
                    .nullIfItemEquals(...nullables.humidity)
                    .transformTupleItem(unitTransformers.humidity)
                    .end(),
            },
        },
        soilMoistures: {
            day: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 368,
                    })
                    .nullIfItemEquals(...nullables.soilMoisture)
                    .transformTupleItem(unitTransformers.soilMoisture)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 356,
                    })
                    .nullIfItemEquals(...nullables.soilMoisture)
                    .transformTupleItem(unitTransformers.soilMoisture)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 372,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 360,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 380,
                    })
                    .nullIfItemEquals(...nullables.soilMoisture)
                    .transformTupleItem(unitTransformers.soilMoisture)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 384,
                    })
                    .nullIfItemEquals(...nullables.soilMoisture)
                    .transformTupleItem(unitTransformers.soilMoisture)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 388,
                    })
                    .nullIfItemEquals(...nullables.soilMoisture)
                    .transformTupleItem(unitTransformers.soilMoisture)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 392,
                    })
                    .nullIfItemEquals(...nullables.soilMoisture)
                    .transformTupleItem(unitTransformers.soilMoisture)
                    .end(),
            },
        },
        leafWetnesses: {
            day: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 408,
                    })
                    .nullIfItemEquals(...nullables.leafWetness)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 396,
                    })
                    .nullIfItemEquals(...nullables.leafWetness)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 412,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE,
                            Type.UINT16_LE
                        ),
                        offset: 400,
                    })
                    .nullIfItemEquals(...nullables.time)
                    .transformTupleItem(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 420,
                    })
                    .nullIfItemEquals(...nullables.leafWetness)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 424,
                    })
                    .nullIfItemEquals(...nullables.leafWetness)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 428,
                    })
                    .nullIfItemEquals(...nullables.leafWetness)
                    .end(),
                high: easy
                    .read({
                        type: Type.TUPLE_4(
                            Type.INT8,
                            Type.INT8,
                            Type.INT8,
                            Type.INT8
                        ),
                        offset: 432,
                    })
                    .nullIfItemEquals(...nullables.leafWetness)
                    .end(),
            },
        },
        humOut: {
            day: {
                low: easy
                    .read({
                        type: Type.UINT8,
                        offset: 276,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
                high: easy
                    .read({
                        type: Type.UINT8,
                        offset: 284,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
                lowTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 292,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
                highTime: easy
                    .read({
                        type: Type.UINT16_LE,
                        offset: 308,
                    })
                    .nullIfEquals(...nullables.time)
                    .transform(transformers.time)
                    .end(),
            },
            month: {
                low: easy
                    .read({
                        type: Type.UINT8,
                        offset: 332,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
                high: easy
                    .read({
                        type: Type.UINT8,
                        offset: 324,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
            },
            year: {
                low: easy
                    .read({
                        type: Type.UINT8,
                        offset: 348,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
                high: easy
                    .read({
                        type: Type.UINT8,
                        offset: 340,
                    })
                    .nullIfEquals(...nullables.humidity)
                    .end(),
            },
        },
    };

    if(!result.press.day.lowTime || result.press.day.low === null){
        result.press.day.low = null;
        result.press.day.lowTime = null;
    }
    if(!result.press.day.highTime || result.press.day.high === null){
        result.press.day.high = null;
        result.press.day.highTime = null;
    }

    if(!result.wind.dayTime || result.wind.day === null){
        result.wind.day = null;
        result.wind.dayTime = null;
    }

    if(!result.chill.dayTime || result.chill.day === null){
        result.chill.day = null;
        result.chill.dayTime = null;
    }

    if(!result.heat.dayTime || result.heat.day === null){
        result.heat.day = null;
        result.heat.dayTime = null;
    }

    if(!result.thsw.dayTime || result.thsw.day === null){
        result.thsw.day = null;
        result.thsw.dayTime = null;
    }

    if(!result.solarRadiation.dayTime || result.solarRadiation.day === null){
        result.solarRadiation.day = null;
        result.solarRadiation.dayTime = null;
    }

    if(!result.uv.dayTime || result.uv.day === null){
        result.uv.day = null;
        result.uv.dayTime = null;
    }

    if(!result.rainRate.dayTime || result.rainRate.day === null){
        result.rainRate.day = null;
        result.rainRate.hour = null;
        result.rainRate.dayTime = null;
    }

    if(!result.tempIn.day.lowTime || result.tempIn.day.low === null){
        result.tempIn.day.low = null;
        result.tempIn.day.lowTime = null;
    }
    if(!result.tempIn.day.highTime || result.tempIn.day.high === null){
        result.tempIn.day.high = null;
        result.tempIn.day.highTime = null;
    }

    if(!result.humIn.day.lowTime || result.humIn.day.low === null){
        result.humIn.day.low = null;
        result.humIn.day.lowTime = null;
    }
    if(!result.humIn.day.highTime || result.humIn.day.high === null){
        result.humIn.day.high = null;
        result.humIn.day.highTime = null;
    }

    if(!result.tempOut.day.lowTime || result.tempOut.day.low === null){
        result.tempOut.day.low = null;
        result.tempOut.day.lowTime = null;
    }
    if(!result.tempOut.day.highTime || result.tempOut.day.high === null){
        result.tempOut.day.high = null;
        result.tempOut.day.highTime = null;
    }

    if(!result.humOut.day.lowTime || result.humOut.day.low === null){
        result.humOut.day.low = null;
        result.humOut.day.lowTime = null;
    }
    if(!result.humOut.day.highTime || result.humOut.day.high === null){
        result.humOut.day.high = null;
        result.humOut.day.highTime = null;
    }

    if(!result.dew.day.lowTime || result.dew.day.low === null){
        result.dew.day.low = null;
        result.dew.day.lowTime = null;
    }
    if(!result.dew.day.highTime || result.dew.day.high === null){
        result.dew.day.high = null;
        result.dew.day.highTime = null;
    }

    setNeighboursNullInTuple(result, "soilMoistures");
    setNeighboursNullInTuple(result, "soilTemps");
    setNeighboursNullInTuple(result, "humExtra");
    setNeighboursNullInTuple(result, "tempExtra");
    setNeighboursNullInTuple(result, "leafTemps");
    setNeighboursNullInTuple(result, "leafWetnesses");


    return result;
}


function setNeighboursNullInTuple(result: HighsAndLows, field: "soilMoistures" | "soilTemps" | "humExtra" | "tempExtra" | "leafTemps" | "leafWetnesses"){
    for(let i = 0; i < result[field].day.lowTime.length; i++){
        if(!result[field].day.lowTime[i] || result[field].day.low[i] === null){
            result[field].day.low[i] = null;
            result[field].day.lowTime[i] = null;
        }
        if(!result[field].day.highTime[i] || result[field].day.high[i] === null){
            result[field].day.high[i] = null;
            result[field].day.highTime[i] = null;
        }
    }
}