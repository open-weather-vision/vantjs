import SimpleRainData from "./SimpleRainData";

/**
 * The rain information returned by the {@link LOOP1} package.
 */
export default class RainData1 extends SimpleRainData {
    /**
     * The amount of rain that has fallen in this month
     */
    public month: number | null = null;

    /**
     * The amount of rain that has fallen in this year
     */
    public year: number | null = null;
}
