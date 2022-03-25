import SimpleETData from "./SimpleETData";

/**
 * Holds daily, monthly and yearly evapotranspiration.
 */
export default class RichETData extends SimpleETData {
    /**
     * Measured evapotranspiration (ET) in the current month
     */
    public month: number | null = null;

    /**
     * Measured evapotranspiration (ET) in the current year
     */
    public year: number | null = null;
}
