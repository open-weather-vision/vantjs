import { RichRealtimeRecord } from "./RichRealtimeRecord";

export default function createNullRichRealtimeRecord() {
    return {
        pressure: {
            current: null,
            currentRaw: null,
            currentAbsolute: null,
            trend: {
                value: null,
                text: null,
            },
            reductionMethod: {
                value: null,
                text: null,
            },
            userOffset: null,
            calibrationOffset: null,
            altimeter: null,
        },
        heat: null,
        dewpoint: null,
        temperature: {
            in: null,
            out: null,
            extra: [null, null, null, null, null, null, null] as [
                null | number,
                null | number,
                null | number,
                null | number,
                null | number,
                null | number,
                null | number
            ],
        },
        leafTemps: [null, null, null, null] as [
            null | number,
            null | number,
            null | number,
            null | number
        ],
        soilTemps: [null, null, null, null] as [
            null | number,
            null | number,
            null | number,
            null | number
        ],
        humidity: {
            in: null,
            out: null,
            extra: [null, null, null, null, null, null, null] as [
                null | number,
                null | number,
                null | number,
                null | number,
                null | number,
                null | number,
                null | number
            ],
        },
        wind: {
            current: null,
            avg: { tenMinutes: null, twoMinutes: null },
            direction: {
                degrees: null,
                abbrevation: null,
            },
            heaviestGust10min: {
                direction: {
                    degrees: null,
                    abbrevation: null,
                },
                speed: null,
            },
            chill: null,
            thsw: null,
        },
        rain: {
            rate: null,
            storm: null,
            stormStartDate: null,
            day: null,
            month: null,
            year: null,
            last15min: null,
            lastHour: null,
            last24h: null,
        },
        et: { day: null, month: null, year: null },
        soilMoistures: [null, null, null, null] as [
            null | number,
            null | number,
            null | number,
            null | number
        ],
        leafWetnesses: [null, null, null, null] as [
            null | number,
            null | number,
            null | number,
            null | number
        ],
        uv: null,
        solarRadiation: null,
        transmitterBatteryStatus: null,
        consoleBatteryVoltage: null,
        forecast: {
            iconNumber: null,
            iconText: null,
            rule: null,
        },
        sunrise: null,
        sunset: null,
        time: new Date(),
    } as RichRealtimeRecord;
}
