import SimpleRainData from "./SimpleRainData";

/**
 * Holds a lot of rain-related data.
 */
export default class RichRainData extends SimpleRainData {
    /**
     * The amount of rain that has fallen in this month
     */
    public month: number | null = null;

    /**
     * The amount of rain that has fallen in this year
     */
    public year: number | null = null;

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
