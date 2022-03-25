/**
 * Holds the daily, monthly and yearly lows of a specific weather element / sensor.
 */
export default class ElementLows {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * The low of the current day
     */
    public day: number | null = null;
    /**
     * The time the low of the current day was measured in the `"hh:mm"` format (e.g. `"11:17"`)
     */
    public dayTime: string | null = null;
    /**
     * The low of the current month
     */
    public month: number | null = null;

    /**
     * The low of the current year
     */
    public year: number | null = null;
}
