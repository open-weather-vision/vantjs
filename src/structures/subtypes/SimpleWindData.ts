import WindDirection from "./WindDirection";

/**
 * Holds the current wind speed, the average wind speed of the recent 10 minutes and the wind's direction in degrees.
 */
export default class SimpleWindData {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * Currently measured wind speed
     */
    public current: number | null = null;

    /**
     * Average wind speed in the recent ten minutes
     */
    public avg10min: number | null = null;

    /**
     * Currently measured wind direction. {@link WindDirection.degrees} encodes it
     * in degrees, {@link WindDirection.abbrevation} as string (`"N"`, `"S"`, ....).
     */
    public direction = new WindDirection();
}
