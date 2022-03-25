import HeaviestGustData from "./HeaviestGustData";
import SimpleWindData from "./SimpleWindData";

/**
 * Holds the current wind speed, the average wind speed of the recent 10 minutes and the wind's direction in degrees.
 */
export default class RichWindData extends SimpleWindData {
    /**
     * Average wind speed in the recent two minutes
     */
    public avg2min: number | null = null;

    /**
     * Direction and speed of the heaviest gust in the recent 10 minutes
     */
    public heaviestGust10min = new HeaviestGustData();

    /**
     * The wind chill
     */
    public chill: number | null = null;
}
