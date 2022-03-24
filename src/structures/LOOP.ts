/**
 * The older LOOP(1) package used by Rev "A" firmware (dated before April 24, 2002).
 * Newer weather stations support this package type too.
 */
export type LOOP1 = {
    /**
     * Currently measured pressure related weather data
     */
    pressure: {
        /** Current pressure */
        current: number | null;

        /**
         * The pressure's trend. There are five possible trends:
         *  - Falling Rapidly
         *  - Falling Slowly
         *  - Steady
         *  - Rising Slowly
         *  - Rising Rapidly
         *
         * `trend.value` encodes them as number, `trend.text` as string.
         */
        trend: {
            /**
             * The pressure's trend encoded as number.
             *  - `-60` stands for *Falling Rapidly*
             *  - `-20` stands for *Falling Slowly*
             *  - `0` stands for *Steady*
             *  - `20` stands for *Rising Slowly*
             *  - `60` stands for *Rising Rapidly*
             */
            value: -60 | -20 | 0 | 20 | 60 | null;
            /**
             * The pressure's trend encoded as string.
             * Possible values are `"Falling Rapidly"`, `"Falling Slowly"`, `"Steady"`, `"Rising Slowly"` and `"Rising Rapidly"`.
             */
            text:
                | "Falling Rapidly"
                | "Steady"
                | "Rising Rapidly"
                | "Rising Slowly"
                | "Falling Slowly"
                | null;
        };
    };

    /**
     * The currently measured temperatures
     */
    temperature: {
        /** Current inside temperature (the console's temperature) */
        in: number | null;

        /** Current outside temperature */
        out: number | null;

        /** Measured temperatures from up to 7 extra sensors */
        extra: [
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null
        ];
    };

    /**
     * Currently measured leaf temperatures (from up to 4 sensors)
     */
    leafTemps: [number | null, number | null, number | null, number | null];

    /**
     * Currently measured soil temperatures (from up to 4 sensors)
     */
    soilTemps: [number | null, number | null, number | null, number | null];

    /**
     * Currently measured (relative) humidities in percent
     */
    humidity: {
        /**
         * Current inside humidity in percent
         */
        in: number | null;

        /**
         * Current outside humidity in percent
         */
        out: number | null;

        /**
         * Measured humidty from up to 7 extra sensors
         */
        extra: [
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null
        ];
    };

    /**
     * Wind related realtime data
     */
    wind: {
        /**
         * Currently measured wind speed
         */
        current: number | null;

        /**
         * Average wind speed in the recent ten minutes
         */
        avg: number | null;

        /**
         * Currently measured wind direction in degrees (from `1` to `360`).
         * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
         */
        direction: number | null;
    };

    /**
     *  Curently measured rain related data
     */
    rain: {
        /**
         * The current rain rate
         */
        rate: number | null;

        /**
         * The most recent rainstorm's amount of rain
         */
        storm: number | null;

        /**
         * The most recent rainstorm's start date (without time)
         */
        stormStartDate: Date | null;

        /**
         * The amount of rain that fell today
         */
        day: number | null;

        /**
         * The amount of rain that has fallen in this month
         */
        month: number | null;

        /**
         * The amount of rain that has fallen in this year
         */
        year: number | null;
    };
    /**
     * Evotranspiration (ET) related data
     */
    et: {
        /**
         * Measured evapotranspiration (ET) of the day
         */
        day: number | null;

        /**
         * Measured evapotranspiration (ET) in the current month
         */
        month: number | null;

        /**
         * Measured evapotranspiration (ET) in the current year
         */
        year: number | null;
    };
    /**
     * Measured soil moisture from up to 4 sensors
     */
    soilMoistures: [number | null, number | null, number | null, number | null];

    /**
     * Measured leaf wetness from up to 4 sensors
     */
    leafWetnesses: [number | null, number | null, number | null, number | null];
    /**
     * The current UV index
     */
    uv: number | null;

    /**
     * The current solar radiation
     */
    solarRadiation: number | null;

    /**
     * Points to the next archive record
     */
    nextArchiveRecord: string | null;

    /**
     * Current alarms states
     */
    alarms: {
        /**
         * Pressure alarms
         */
        pressure: {
            /**
             * Whether the falling bar trend alarm is active
             */
            falling: boolean | null;
            /**
             * Whether the rising bar trend alarm is active
             */
            rising: boolean | null;
        };

        /**
         * Inside temperature alarms
         */
        tempIn: {
            /**
             * Whether the low inside temperature alarm is active
             */
            low: boolean | null;

            /**
             * Whether the high inside temperature alarm is active
             */
            high: boolean | null;
        };

        /**
         * Inside humdity alarms
         */
        humIn: {
            /**
             * Whether the low inside humidity alarm is active
             */
            low: boolean | null;

            /**
             * Whether the high inside humidity alarm is active
             */
            high: boolean | null;
        };

        /**
         * Whether the time alarm is active
         */
        time: boolean | null;

        /**
         * Rain (rate) alarms
         */
        rain: {
            /**
             * Whether the high rain rate alarm is active
             */
            rate: boolean | null;

            /**
             * Whether the 15min rain (flash flood) alarm is active
             */
            quarter: boolean | null;

            /**
             * Whether the 24 hour rain alarm is active
             */
            daily: boolean | null;

            /**
             * Whether the storm total rain alarm is active
             */
            stormTotal: boolean | null;
        };

        /**
         * Whether the daily ET alarm is active
         */
        dailyET: boolean | null;

        /**
         * Outside temperature alarms
         */
        tempOut: {
            /**
             * Whether the a low outside temperature alarm is active
             */
            low: boolean | null;

            /**
             * Whether the a high outside temperature alarm is active
             */
            high: boolean | null;
        };

        /**
         * Wind alarms
         */
        wind: {
            /**
             * Whether the wind speed alarm is active
             */
            speed: boolean | null;

            /** Whether the 10 min avg wind speed alarm is active */
            avg: boolean | null;
        };
        /**
         * Dewpoint alarms
         */
        dewpoint: {
            /**
             * Whether the low dewpoint alarm is active
             */
            low: boolean | null;

            /**
             * Whether the high dewpoint alarm is active
             */
            high: boolean | null;
        };

        /**
         * Whether the high heat index alarm is active
         */
        heat: boolean | null;

        /**
         * Whether the low wind chill alarm is active
         */
        chill: boolean | null;

        /**
         * Whether the high THSW index alarm is active
         */
        thsw: boolean | null;

        /**
         * Whether the high solar radiation alarm is active
         */
        solarRadiation: boolean | null;

        /**
         * UV alarms
         */
        UV: {
            /**
             * Whether the UV Dose alarm is active
             */
            dose: boolean | null;

            /**
             * Whether a UV dose alarm threshold has been entered AND the daily UV dose has been manually cleared
             */
            enabledAndCleared: boolean | null;

            /**
             * Whether the high UV index alarm is active
             */
            high: boolean | null;
        };

        /**
         * Outside humidity alarms
         */
        humOut: {
            /**
             * Whether the low outside humdity alarm is active
             */
            low: boolean | null;
            /**
             * Whether the high outside humdity alarm is active
             */
            high: boolean | null;
        };

        /**
         * Extra temperature alarms (for up to 7 sensors)
         * `extraTemps[i].low` is `true` when the low extra temperature alarm for sensor `i` is active,
         * `extraTemps[i].high` is `true` when the high extra temperature alarm for sensor `i` is active.
         */
        extraTemps: [
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null }
        ];

        /**
         * Extra humdity alarms (for up to 7 sensors)
         * `extraHums[i].low` is `true` when the low extra humidity alarm for sensor `i` is active,
         * `extraHums[i].high` is `true` when the high extra humidity alarm for sensor `i` is active.
         */
        extraHums: [
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null }
        ];

        /**
         * Leaf wetness alarms (for up to 4 sensors)
         * `leafWetnesses[i].low` is `true` when the low leaf wetness alarm for sensor `i` is active,
         * `leafWetnesses[i].high` is `true` when the high leaf wetness alarm for sensor `i` is active.
         */
        leafWetnesses: [
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null }
        ];

        /**
         * Soil moisture alarms (for up to 4 sensors)
         * `soilMoistures[i].low` is `true` when the low soil moisture alarm for sensor `i` is active,
         * `soilMoistures[i].high` is `true` when the high soil moisture alarm for sensor `i` is active.
         */
        soilMoistures: [
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null }
        ];

        /**
         * Leaf temperature alarms (for up to 4 sensors)
         * `leafTemps[i].low` is `true` when the low leaf temperature alarm for sensor `i` is active,
         * `leafTemps[i].high` is `true` when the high leaf temperature alarm for sensor `i` is active.
         */
        leafTemps: [
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null }
        ];

        /**
         * Soil temperature alarms (for up to 4 sensors)
         * `soilTemps[i].low` is `true` when the low soil temperature alarm for sensor `i` is active,
         * `soilTemps[i].high` is `true` when the high soil temperature alarm for sensor `i` is active.
         */
        soilTemps: [
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null },
            { low: boolean | null; high: boolean | null }
        ];
    };

    /**
     * The transmitter's battery status (poorly documented)
     */
    transmitterBatteryStatus: number | null;

    /**
     * The console's battery voltage
     */
    consoleBatteryVoltage: number | null;

    /**
     * The calculated forecast. `forecast.iconNumber` encodes it as `number`, `forecast.iconText` as `string`.
     */
    forecast: {
        /**
         * The calculated forecast encoded as number:
         * - `8` => Sun
         * - `6` => Partly Cloudy
         * - `2` => Mostly Cloudy
         * - `3` => Mostly Cloudy, Rain within 12 hours
         * - `18` => Mostly Cloudy, Snow within 12 hours
         * - `19` => Partly Cloudy, Rain or Snow within 12 hours
         * - `7` => Partly Cloudy, Rain within 12 hours
         * - `22` => Partly Cloudy, Snow within 12 hours
         * - `23` => Partly Cloudy, Rain or Snow within 12 hours
         */
        iconNumber: 8 | 6 | 2 | 3 | 18 | 19 | 7 | 22 | 23 | null;

        /**
         * The calculated forecast encoded as string
         */
        iconText:
            | "Mostly Clear"
            | "Partly Cloudy"
            | "Mostly Cloudy"
            | "Mostly Cloudy, Rain within 12 hours"
            | "Mostly Cloudy, Snow within 12 hours"
            | "Mostly Cloudy, Rain or Snow within 12 hours"
            | "Partly Cloudy, Rain within 12 hours"
            | "Partly Cloudy, Rain or Snow within 12 hours"
            | "Partly Cloudy, Snow within 12 hours"
            | null;

        /**
         * Not documented
         */
        rule: number | null;
    };

    /**
     * The today's sunrise time (e.g. `06:35`)
     */
    sunrise: string | null;

    /**
     * The today's sunset time (e.g. `19:35`)
     */
    sunset: string | null;

    /**
     * The package type (always `"LOOP1"`)
     */
    packageType: "LOOP1";
};

/**
 * The newer LOOP2 package used by Rev "B" firmware (dated after April 24, 2002 / Firmware 1.90^).
 * Older weather stations don't support this package type. The Vantage Pro doesn't support this package at all.
 */
export type LOOP2 = {
    /**
     * Currently measured pressure related weather data
     */
    pressure: {
        /** Current pressure */
        current: number | null;
        /** Barometric sensor raw reading */
        currentRaw: number | null;
        /** Absolute barometric pressure. Equals to the raw sensor reading plus user entered offset. */
        currentAbsolute: number | null;
        /**
         * The pressure's trend. There are five possible trends:
         *  - Falling Rapidly
         *  - Falling Slowly
         *  - Steady
         *  - Rising Slowly
         *  - Rising Rapidly
         *
         * `trend.value` encodes them as number, `trend.text` as string.
         */
        trend: {
            /**
             * The pressure's trend encoded as number.
             *  - `-60` stands for *Falling Rapidly*
             *  - `-20` stands for *Falling Slowly*
             *  - `0` stands for *Steady*
             *  - `20` stands for *Rising Slowly*
             *  - `60` stands for *Rising Rapidly*
             */
            value: -60 | -20 | 0 | 20 | 60 | null;
            /**
             * The pressure's trend encoded as string.
             * Possible values are `"Falling Rapidly"`, `"Falling Slowly"`, `"Steady"`, `"Rising Slowly"` and `"Rising Rapidly"`.
             */
            text:
                | "Falling Rapidly"
                | "Steady"
                | "Rising Rapidly"
                | "Rising Slowly"
                | "Falling Slowly"
                | null;
        };
        /**
         * The used barometric reduction method to calculate the ground pressure
         * `reductionMethod.value` encodes it as `number`, `reductionMethod.text` as `string`.
         * There are three different settings:
         *  - user offset
         *  - altimeter setting
         *  - NOAA bar reduction
         */
        reductionMethod: {
            /**
             * The used barometric reduction method encoded as string.
             * `0` is user offset, `1` is altimeter setting and `2` is NOAA bar reduction.
             */
            value: 0 | 1 | 2 | null;
            /**
             * The used barometric reduction method encoded as string.
             * There are three different settings:
             *  - user offset
             *  - altimeter setting
             *  - NOAA bar reduction
             */
            text:
                | "user offset"
                | "altimeter setting"
                | "NOAA bar reduction"
                | null;
        };
        /**
         * The user-entered barometric offset
         */
        userOffset: number | null;
        /**
         * The barometer calibration number
         */
        calibrationOffset: number | null;

        /**
         * The altimeter setting
         */
        altimeter: number | null;
    };
    /**
     * The measured heat index
     */
    heat: number | null;

    /**
     * The calculated dew point
     */
    dewpoint: number | null;

    /**
     * Current inside and outside temperature
     */
    temperature: {
        /** Current inside temperature (the console's temperature) */
        in: number | null;
        /** Current outside temperature */
        out: number | null;
    };
    /** Current inside and outside humidity (relative) in percent  */
    humidity: {
        /** Current inside humidity (relative) in percent */
        in: number | null;
        /** Current outside humidity (relative) in percent */
        out: number | null;
    };
    /**
     * Wind related realtime data
     */
    wind: {
        /**
         * Currently measured wind speed
         */
        current: number | null;
        /**
         * Holds the 2min and 10min average wind speed
         */
        avg: {
            /** The average wind speed in the recent ten minutes */
            tenMinutes: number | null;
            /** The average wind speed in the recent two minutes */
            twoMinutes: number | null;
        };
        /**
         * Currently measured wind direction in degrees (from `1` to `360`).
         * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
         */
        direction: number | null;
        /**
         * Direction and speed of the heaviest gust in the recent 10 minutes
         */
        heaviestGust10min: {
            /**
             * The heaviest gust's (10min) direction in degrees (from `1` to `360`).
             * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
             */
            direction: number | null;

            /**
             * The heaviest gust's (10min) speed
             */
            speed: number | null;
        };
        chill: number | null;
    };

    /**
     * The currently measured THSW index. Requires a solar radiation sensor.
     */
    thsw: number | null;
    /**
     *  Curently measured rain related data
     */
    rain: {
        /**
         * The current rain rate
         */
        rate: number | null;
        /**
         * The most recent rainstorm's amount of rain
         */
        storm: number | null;
        /**
         * The most recent rainstorm's start date (without time)
         */
        stormStartDate: Date | null;
        /**
         * The amount of rain that fell today
         */
        day: number | null;
        /**
         * The amount of rain that has fallen in the recent 15 minutes
         */
        last15min: number | null;
        /**
         * The amount of rain that has fallen in the recent hour
         */
        lastHour: number | null;
        /**
         * The amount of rain that has fallen in the recent 24 hours
         */
        last24h: number | null;
    };
    /**
     * Evotranspiration (ET) related data
     */
    et: {
        /**
         * Measured evapotranspiration (ET) of the day
         */
        day: number | null;
    };
    /**
     * The current UV index
     */
    uv: number | null;
    /**
     * The current solar radiation
     */
    solarRadiation: number | null;
    /**
     * The current graph's pointers
     */
    graphPointers: {
        /**
         * Points to the next 10-minute wind speed graph point. For current
         * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
         * console and 0 to 24 on Vantage Vue console)
         */
        next10mWindSpeed: number;
        /**
         * Points to the next 15-minute wind speed graph point. For current
         * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
         * console and 0 to 24 on Vantage Vue console)
         */
        next15mWindSpeed: number;
        /**
         * Points to the next hour wind speed graph point. For current
         * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
         * console and 0 to 24 on Vantage Vue console)
         */
        nextHourWindSpeed: number;
        /**
         * Points to the next daily wind speed graph point. For current
         * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
         * console and 0 to 24 on Vantage Vue console)
         */
        nextDailyWindSpeed: number;
        /**
         * Points to the next minute rain graph point. For current
         * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
         * console and 0 to 24 on Vantage Vue console)
         */
        nextMinuteRain: number;
        /**
         * Points to the next monthly rain graph point. For current
         * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
         * console and 0 to 24 on Vantage Vue console)
         */
        nextMonthlyRain: number;
        /**
         * Points to the next yearly rain graph point. For current
         * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
         * console and 0 to 24 on Vantage Vue console)
         */
        nextYearlyRain: number;
        /**
         * Points to the next seasonal rain graph point. Yearly rain always
         * resets at the beginning of the calendar, but seasonal rain resets
         * when rain season begins. For current graph point, just subtract 1
         * (range from 0 to 23 on VP/VP2 console and 0 to 24 on Vantage
         * Vue console)
         */
        nextSeasonalRain: number;

        /**
         * Points to the next rain storm graph point. For current
         * graph point, just subtract 1 (range from 0 to 23 on VP/VP2
         * console and 0 to 24 on Vantage Vue console)
         */
        nextRainStorm: number;

        /*
         * Keeps track of the minute within an hour for the rain
         * calculation. (range from 0 to 59)
         * */
        currentMinuteIndex: number;
    };

    /**
     * The package type (always "LOOP2")
     */
    packageType: LOOPPackageType.LOOP2;
};

/**
 * Either a {@link LOOP1} or {@link LOOP2} package.
 */
export type LOOPPackage = LOOP1 | LOOP2;

/**
 * Type used to request {@link LOOP1} and {@link LOOP2} packages.
 */
export enum LOOPPackageType {
    /**
     * The older LOOP(1) package used by Rev "A" firmware (dated before April 24, 2002).
     * Newer weather stations support this package type too.
     */
    LOOP1 = "LOOP1",

    /**
     * The newer LOOP2 package used by Rev "B" firmware (dated after April 24, 2002 / Firmware 1.90^).
     * Older weather stations don't support this package type. The Vantage Pro doesn't support this package at all.
     */
    LOOP2 = "LOOP2",
}
