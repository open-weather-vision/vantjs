/**
 * Holds information about the currently used pressure reduction method.
 */
export default class PressureReductionMethod {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * The used barometric reduction method encoded as string.
     * `0` is user offset, `1` is altimeter setting and `2` is NOAA bar reduction.
     */
    public value: 0 | 1 | 2 | null = null;
    /**
     * The used barometric reduction method encoded as string.
     * There are three different settings:
     *  - user offset
     *  - altimeter setting
     *  - NOAA bar reduction
     */
    public text:
        | "user offset"
        | "altimeter setting"
        | "NOAA bar reduction"
        | null = null;
}
