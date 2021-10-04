export type SimpleRealtimeRecord = {
    pressure: {
        current: number | null,
        trend: {
            value: -60 | -20 | 0 | 20 | 60 | null,
            text: "Falling Rapidly" | "Steady" | "Rising Rapidly" | "Rising Slowly" | "Falling Slowly" | null
        }
    },
    temperature: {
        in: number | null,
        out: number | null,
    },
    humidity: {
        in: number | null,
        out: number | null
    },
    wind: {
        current: number | null,
        avg: number | null,
        direction: number | null
    },
    rain: {
        rate: number | null,
        storm: number | null,
        stormStartDate: Date | null,
        day: number | null,
    },
    et: { day: number | null },
    uv: number | null,
    solarRadiation: number | null,
    time: Date,
}