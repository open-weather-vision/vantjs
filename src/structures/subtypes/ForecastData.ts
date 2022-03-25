export default class ForecastData {
    /**
     * @hidden
     */
    constructor() {}
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
    public iconNumber: 8 | 6 | 2 | 3 | 18 | 19 | 7 | 22 | 23 | null = null;

    /**
     * The calculated forecast encoded as string
     */
    public iconText:
        | "Mostly Clear"
        | "Partly Cloudy"
        | "Mostly Cloudy"
        | "Mostly Cloudy, Rain within 12 hours"
        | "Mostly Cloudy, Snow within 12 hours"
        | "Mostly Cloudy, Rain or Snow within 12 hours"
        | "Partly Cloudy, Rain within 12 hours"
        | "Partly Cloudy, Rain or Snow within 12 hours"
        | "Partly Cloudy, Snow within 12 hours"
        | null = null;

    /**
     * Not documented
     */
    public rule: number | null = null;
}
