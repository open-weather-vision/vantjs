/**
 * Holds a weather element's / sensor's high and low (and the time they were measured) of the current day.
 */
export default class DailyHighAndLow {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * The low of the current day
     */
    public low: number | null = null;
    /**
     * The high of the current day
     */
    public high: number | null = null;
    /**
     * The time the low of the current day was measured in the `"hh:mm"` format (e.g. `"11:17"`)
     */
    public lowTime: string | null = null;
    /**
     * The time the high of the current day was measured in the `"hh:mm"` format (e.g. `"11:17"`)
     */
    public highTime: string | null = null;
}
