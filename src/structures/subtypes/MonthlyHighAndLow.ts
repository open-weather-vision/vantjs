/**
 * Holds a weather element's / sensor's high and low of the current month
 */
export default class MonthlyHighAndLow {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * The low of the current month
     */
    public low: number | null = null;
    /**
     * The high of the current month
     */
    public high: number | null = null;
}
