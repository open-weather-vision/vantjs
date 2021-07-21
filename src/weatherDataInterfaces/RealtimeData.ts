export type RealtimeData = {
    pressure: { current: number | null, trend: { value: number | null, text: string | null } },
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
        // TODO: Change type to string | null when parsing is completed
        stormStartDate: number | null,
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
    forecast: { iconNumber: number | null, iconText: string | null, rule: number | null },
    sunrise: string | null,
    sunset: string | null,
    packageType: "LOOP"
} | {
    pressure: {
        current: number | null,
        currentRaw: number | null,
        currentAbsolute: number | null,
        trend: { value: number | null, text: string | null },
        reductionMethod: { value: number | null, text: string | null },
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
        // TODO: Change type to string | null after parsing completed
        stormStartDate: number | null,
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