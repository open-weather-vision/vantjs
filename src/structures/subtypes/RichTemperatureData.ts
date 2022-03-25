import SimpleTemperatureData from "./SimpleTemperatureData";

/**
 * Holds the current inside and outside temperature and measured temperatures from up to 7 extra sensors
 */
export default class RichTemperatureData extends SimpleTemperatureData {
    /** Measured temperatures from up to 7 extra sensors */
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
