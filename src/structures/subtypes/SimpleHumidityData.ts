/**
 * Holds the current inside and outside humidity
 */
export default class SimpleHumidityData {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * Current inside humidity in percent
     */
    public in: number | null = null;

    /**
     * Current outside humidity in percent
     */
    public out: number | null = null;
}
