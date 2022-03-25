import DailyHighAndLow from "./DailyHighAndLow";
import MonthlyHighAndLow from "./MonthlyHighAndLow";
import YearlyHighAndLow from "./YearlyHighAndLow";

/**
 * Holds the daily, monthly and yearly highs and lows of a specific weather element / sensor.
 */
export default class ElementHighsAndLows {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * The high and low (and the time they were measured) of the current day
     */
    public day: DailyHighAndLow = new DailyHighAndLow();
    /**
     * The high and low of the current month
     */
    public month: MonthlyHighAndLow = new MonthlyHighAndLow();
    /**
     * The high and low of the current year
     */
    public year: YearlyHighAndLow = new YearlyHighAndLow();
}
