/**
 * Contains a lot of useful realtime weather data. Only works on Vantage Vue and Vantage Pro 2.
 */
export type RichRealtimeRecord = {
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
         * Holds the 2min and 10min average wind speed
         */
        avg: {
            /** The average wind speed in the recent ten minutes */
            tenMinutes: number | null;
            /** The average wind speed in the recent two minutes */
            twoMinutes: number | null;
        };
        /**
         * Currently measured wind direction. `direction.degrees` encodes it
         * in degrees, `direction.abbrevation` as string (`"N"`, `"S"`, ....).
         */
        direction: {
            /**
             * Currently measured wind direction in degrees (from `1` to `360`).
             * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
             */
            degrees: number | null;

            /**
             * Currently measured wind direction encoded as string
             */
            abbrevation:
                | "NNE"
                | "NE"
                | "ENE"
                | "E"
                | "ESE"
                | "SE"
                | "SSE"
                | "S"
                | "SSW"
                | "SW"
                | "WSW"
                | "W"
                | "WNW"
                | "NW"
                | "NNW"
                | "N"
                | null;
        };

        /**
         * Direction and speed of the heaviest gust in the recent 10 minutes
         */
        heaviestGust10min: {
            /**
             * Direction of the heaviest gust in the recent 10 minutes. `direction.degrees` encodes it
             * in degrees, `direction.abbrevation` as string (`"N"`, `"S"`, ....).
             */
            direction: {
                /**
                 * The heaviest gust's (10min) direction in degrees (from `1` to `360`).
                 * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
                 */
                degrees: number | null;

                /**
                 * The heaviest gust's (10min) wind direction encoded as string
                 */
                abbrevation:
                    | "NNE"
                    | "NE"
                    | "ENE"
                    | "E"
                    | "ESE"
                    | "SE"
                    | "SSE"
                    | "S"
                    | "SSW"
                    | "SW"
                    | "WSW"
                    | "W"
                    | "WNW"
                    | "NW"
                    | "NNW"
                    | "N"
                    | null;
            };

            /**
             * The heaviest gust's (10min) speed
             */
            speed: number | null;
        };
        /**
         * The currently measured wind chill
         */
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
         * The amount of rain that has fallen in this month
         */
        month: number | null;
        /**
         * The amount of rain that has fallen in this year
         */
        year: number | null;
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
     * The time the record was created
     */
    time: Date;
};
