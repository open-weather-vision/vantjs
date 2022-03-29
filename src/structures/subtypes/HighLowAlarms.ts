/**
 *  Holds two booleans storing whether the weather element's high / low alarm is active.
 */
export default class HighLowAlarms {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * Whether the low value alarm is active
     */
    low: boolean | null = null;

    /**
     * Whether the high value alarm is active
     */
    high: boolean | null = null;
}
