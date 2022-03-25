export default class SimpleRainData {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * The current rain rate
     */
    public rate: number | null = null;

    /**
     * The most recent rainstorm's amount of rain
     */
    public storm: number | null = null;

    /**
     * The most recent rainstorm's start date (without time)
     */
    public stormStartDate: Date | null = null;

    /**
     * The amount of rain that fell today
     */
    public day: number | null = null;
}
