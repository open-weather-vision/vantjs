/**
 * Holds the daily, monthly and yearly highs of a specific weather element / sensor.
 */
export default class ElementHighs {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * The high of the current day
     */
    public day: number | null = null;
    /**
     * The time the high of the current day was measured in the `"hh:mm"` format (e.g. `"11:17"`)
     */
    public dayTime: string | null = null;
    /**
     * The high of the current month
     */
    public month: number | null = null;

    /**
     * The high of the current year
     */
    public year: number | null = null;
}
