import SimpleRainData from "./SimpleRainData";

/**
 * The rain information returned by the {@link LOOP2} package.
 */
export default class RainData2 extends SimpleRainData {
    /**
     * The amount of rain that has fallen in the recent 15 minutes
     */
    public last15min: number | null = null;
    /**
     * The amount of rain that has fallen in the recent hour
     */
    public lastHour: number | null = null;
    /**
     * The amount of rain that has fallen in the recent 24 hours
     */
    public last24h: number | null = null;
}
