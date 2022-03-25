/**
 * Holds the hourly, daily, monthly and yearly highs of the rain rate.
 */
export default class RainRateHighs {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * The highest rain rate of the current hour
     */
    public hour: number | null = null;
    /**
     * The highest rain rate of the current day
     */
    public day: number | null = null;
    /**
     * The time the highest rain rate of the current day was measured in the `"hh:mm"` format (e.g. `"11:17"`)
     */
    public dayTime: string | null = null;

    /**
     * The highest rain rate of the current month
     */
    public month: number | null = null;

    /**
     * The highest rain rate of the current year
     */
    public year: number | null = null;
}
