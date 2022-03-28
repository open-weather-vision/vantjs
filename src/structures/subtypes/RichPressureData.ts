import PressureReductionMethod from "./PressureReductionMethod";
import SimplePressureData from "./SimplePressureData";

/**
 * Holds a lot of pressure related data.
 */
export default class RichPressureData extends SimplePressureData {
    /** Barometric sensor raw reading */
    public currentRaw: number | null = null;

    /** Absolute barometric pressure. Equals to the raw sensor reading plus user entered offset. */
    public currentAbsolute: number | null = null;
    /**
     * The used barometric reduction method to calculate the ground pressure
     * `reductionMethod.value` encodes it as `number`, `reductionMethod.text` as `string`.
     * There are three different settings:
     *  - user offset
     *  - altimeter setting
     *  - NOAA bar reduction
     */
    public reductionMethod = new PressureReductionMethod();
    /**
     * The user-entered barometric offset
     */
    public userOffset: number | null = null;
    /**
     * The barometer calibration number
     */
    public calibrationOffset: number | null = null;

    /**
     * The altimeter setting
     */
    public altimeter: number | null = null;
}
