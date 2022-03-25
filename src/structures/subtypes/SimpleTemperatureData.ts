/**
 * Holds the current inside and outside temperature
 */
export default class SimpleTemperatureData {
    /**
     * @hidden
     */
    constructor() {}
    /** Current inside temperature (the console's temperature) */
    public in: number | null = null;

    /** Current outside temperature */
    public out: number | null = null;
}
