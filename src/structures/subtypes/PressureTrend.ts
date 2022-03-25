/**
 * The pressure's trend. There are five possible trends:
 *  - Falling Rapidly
 *  - Falling Slowly
 *  - Steady
 *  - Rising Slowly
 *  - Rising Rapidly
 *
 * {@link value} encodes them as number, {@link text} as string.
 */
export default class PressureTrend {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * The pressure's trend encoded as number.
     *  - `-60` stands for *Falling Rapidly*
     *  - `-20` stands for *Falling Slowly*
     *  - `0` stands for *Steady*
     *  - `20` stands for *Rising Slowly*
     *  - `60` stands for *Rising Rapidly*
     */
    public value: -60 | -20 | 0 | 20 | 60 | null = null;
    /**
     * The pressure's trend encoded as string.
     * Possible values are `"Falling Rapidly"`, `"Falling Slowly"`, `"Steady"`, `"Rising Slowly"` and `"Rising Rapidly"`.
     */
    public text:
        | "Falling Rapidly"
        | "Steady"
        | "Rising Rapidly"
        | "Rising Slowly"
        | "Falling Slowly"
        | null = null;
}
