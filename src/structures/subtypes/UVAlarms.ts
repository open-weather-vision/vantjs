/**
 * Activity of the UV alarms
 */
export default class UVAlarms {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * Whether the UV Dose alarm is active
     */
    public dose: boolean | null = null;

    /**
     * Whether a UV dose alarm threshold has been entered AND the daily UV dose has been manually cleared
     */
    public enabledAndCleared: boolean | null = null;

    /**
     * Whether the high UV index alarm is active
     */
    public high: boolean | null = null;
}
