/**
 * Activity of the rain alarms
 */

export default class RainAlarms {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * Whether the high rain rate alarm is active
     */
    public rate: boolean | null = null;

    /**
     * Whether the 15min rain (flash flood) alarm is active
     */
    public quarter: boolean | null = null;

    /**
     * Whether the 24 hour rain alarm is active
     */
    public daily: boolean | null = null;

    /**
     * Whether the storm total rain alarm is active
     */
    public stormTotal: boolean | null = null;
}
