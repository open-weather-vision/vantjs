import PressureTrend from "./PressureTrend";

/**
 * Holds the current pressure and the pressure's trend
 */
export default class SimplePressureData {
    /**
     * @hidden
     */
    constructor() {}
    /** Current pressure */
    public current: number | null = null;

    /**
     * The pressure's trend. There are five possible trends:
     *  - Falling Rapidly
     *  - Falling Slowly
     *  - Steady
     *  - Rising Slowly
     *  - Rising Rapidly
     *
     * {@link PressureTrend.value} encodes them as number, {@link PressureTrend.text} as string.
     */
    public trend = new PressureTrend();
}
