export type RealtimeData = {
    pressure: { current: number | null, trend: { value: -60 | -20 | 0 | 20 | 60 | null, text: "Falling Rapidly" | "Steady" | "Rising Rapidly" | "Rising Slowly" | "Falling Slowly" | null } },
    temperature: {
        in: number | null,
        out: number | null,
        extra: [
            number | null, number | null,
            number | null, number | null,
            number | null, number | null,
            number | null
        ]
    },
    leafTemps: [number | null, number | null, number | null, number | null],
    soilTemps: [number | null, number | null, number | null, number | null],
    humidity: {
        in: number | null,
        out: number | null,
        extra: [
            number | null, number | null,
            number | null, number | null,
            number | null, number | null,
            number | null
        ]
    },
    wind: { current: number | null, avg: number | null, direction: number | null },
    rain: {
        rate: number | null,
        storm: number | null,
        stormStartDate: Date | null,
        day: number | null,
        month: number | null,
        year: number | null
    },
    et: { day: number | null, month: number | null, year: number | null },
    soilMoistures: [number | null, number | null, number | null, number | null],
    leafWetnesses: [number | null, number | null, number | null, number | null],
    uv: number | null,
    solarRadiation: number | null,
    nextArchiveRecord: string | null,
    alarms: {
        pressure: { falling: boolean | null, rising: boolean | null },
        tempIn: { low: boolean | null, high: boolean | null },
        humIn: { low: boolean | null, high: boolean | null },
        time: boolean | null,
        rain: { rate: boolean | null, quarter: boolean | null, daily: boolean | null, stormTotal: boolean | null },
        dailyET: boolean | null,
        tempOut: { low: boolean | null, high: boolean | null },
        wind: { speed: boolean | null, avg: boolean | null },
        dewpoint: { low: boolean | null, high: boolean | null },
        heat: boolean | null,
        chill: boolean | null,
        THSW: boolean | null,
        solarRadiation: boolean | null,
        UV: { dose: boolean | null, enabledAndCleared: boolean | null, high: boolean | null },
        humOut: { low: boolean | null, high: boolean | null },
        extraTemps: [
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null }
        ],
        extraHums: [
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null }
        ],
        leafWetnesses: [
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null }
        ],
        soilMoistures: [
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null }
        ],
        leafTemps: [
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null }
        ],
        soilTemps: [
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null },
            { low: boolean | null, high: boolean | null }
        ]
    },
    transmitterBatteryStatus: number | null,
    consoleBatteryVoltage: number | null,
    forecast: { iconNumber: 8 | 6 | 2 | 3 | 18 | 19 | 7 | 22 | 23 | null, iconText: "Mostly Clear" | "Partly Cloudy" | "Mostly Cloudy" | "Mostly Cloudy, Rain within 12 hours" | "Mostly Cloudy, Snow within 12 hours" | "Mostly Cloudy, Rain or Snow within 12 hours" | "Partly Cloudy, Rain within 12 hours" | "Partly Cloudy, Rain or Snow within 12 hours" | "Partly Cloudy, Snow within 12 hours" | null, rule: number | null },
    sunrise: string | null,
    sunset: string | null,
    packageType: "LOOP"
} | {
    pressure: {
        current: number | null,
        currentRaw: number | null,
        currentAbsolute: number | null,
        trend: { value: -60 | -20 | 0 | 20 | 60 | null, text: "Falling Rapidly" | "Steady" | "Rising Rapidly" | "Rising Slowly" | "Falling Slowly" | null },
        reductionMethod: { value: 0 | 1 | 2 | null, text: "user offset" | "altimeter setting" | "NOAA bar reduction" | null },
        userOffset: number | null,
        calibrationOffset: number | null
    },
    altimeter: number | null,
    heat: number | null,
    dewpoint: number | null,
    temperature: { in: number | null, out: number | null },
    humidity: { in: number | null, out: number | null },
    wind: {
        current: number | null,
        avg: { tenMinutes: number | null, twoMinutes: number | null },
        direction: number | null,
        heaviestGust10min: { direction: number | null, speed: number | null },
        chill: number | null,
        thsw: number | null
    },
    rain: {
        rate: number | null,
        storm: number | null,
        stormStartDate: Date | null,
        day: number | null,
        last15min: number | null,
        lastHour: number | null,
        last24h: number | null
    },
    et: { day: number | null },
    uv: number | null,
    solarRadiation: number | null,
    packageType: 'LOOP2'
}


export enum RealtimePackage {
    LOOP = "LOOP", LOOP2 = "LOOP2"
}