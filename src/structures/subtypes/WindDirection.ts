/**
 * Describes the wind's direction. {@link degrees} encodes it
 * in degrees, {@link abbrevation} as string (`"N"`, `"S"`, ....).
 */
export default class WindDirection {
    /**
     * @hidden
     */
    constructor() {}

    /**
     * The direction in degrees (from `1` to `360`).
     * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
     */
    public degrees: number | null = null;

    /**
     * The direction encoded as string
     */
    public abbrevation:
        | "NNE"
        | "NE"
        | "ENE"
        | "E"
        | "ESE"
        | "SE"
        | "SSE"
        | "S"
        | "SSW"
        | "SW"
        | "WSW"
        | "W"
        | "WNW"
        | "NW"
        | "NNW"
        | "N"
        | null = null;
}
