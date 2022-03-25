import SimpleHumidityData from "./SimpleHumidityData";

/**
 * Holds the current inside and outside humidity and measured humidities from up to 7 extra sensors
 */
export default class RichHumidityData extends SimpleHumidityData {
    /**
     * Measured humidty from up to 7 extra sensors
     */
    public extra: [
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null, null, null, null];
}
