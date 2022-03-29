/**
 * Activity of the wind alarms
 */
export default class WindAlarms {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * Whether the wind speed alarm is active
     */
    public speed: boolean | null = null;

    /** Whether the 10 min avg wind speed alarm is active */
    public avg: boolean | null = null;
}
