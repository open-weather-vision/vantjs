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

        /** Up to 7 extra temperatures */
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
     * Currently measured leaf temperatures (up to 4)
     */
    leafTemps: [number | null, number | null, number | null, number | null];

    /**
     * Currently measured soil temperatures (up to 4)
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
         * Up to 7 extra humidities
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
         * The current wind speed
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
        direction: {
            degrees: number | null;
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
        heaviestGust10min: {
            direction: {
                degrees: number | null;
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
            speed: number | null;
        };
        chill: number | null;
        thsw: number | null;
    };
    rain: {
        rate: number | null;
        storm: number | null;
        stormStartDate: Date | null;
        day: number | null;
        month: number | null;
        year: number | null;
        last15min: number | null;
        lastHour: number | null;
        last24h: number | null;
    };
    et: { day: number | null; month: number | null; year: number | null };
    soilMoistures: [number | null, number | null, number | null, number | null];
    leafWetnesses: [number | null, number | null, number | null, number | null];
    uv: number | null;
    solarRadiation: number | null;
    transmitterBatteryStatus: number | null;
    consoleBatteryVoltage: number | null;
    forecast: {
        iconNumber: 8 | 6 | 2 | 3 | 18 | 19 | 7 | 22 | 23 | null;
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
        rule: number | null;
    };
    sunrise: string | null;
    sunset: string | null;
    time: Date;
};
