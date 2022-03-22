import { SimpleRealtimeRecord } from "./SimpleRealtimeRecord";

export default function createNullSimpleRealtimeRecord() {
    return {
        pressure: {
            current: null,
            trend: {
                value: null,
                text: null,
            },
        },
        temperature: {
            in: null,
            out: null,
        },
        humidity: {
            in: null,
            out: null,
        },
        wind: {
            current: null,
            avg: null,
            direction: null,
        },
        rain: {
            rate: null,
            storm: null,
            stormStartDate: null,
            day: null,
        },
        et: { day: null },
        uv: null,
        solarRadiation: null,
        time: new Date(),
    } as SimpleRealtimeRecord;
}
