import { LOOPPackageType } from "./LOOPPackageType";
import SimpleRealtimeData from "./SimpleRealtimeData";
import GraphPointers from "./subtypes/GraphPointers";

/**
 * The newer LOOP2 package used by Rev "B" firmware (dated after April 24, 2002 / v1.90 or above).
 * Older weather stations don't support this package type. The Vantage Pro doesn't support this package at all.
 */
export default class LOOP2 extends SimpleRealtimeData {
    /** Barometric sensor raw reading */
    public pressRaw: number | null = null;

    /** Absolute barometric pressure. Equals to the raw sensor ({@link pressRaw}) reading plus user entered offset ({@link pressUserOffset}). */
    public pressAbs: number | null = null;

    /**
     * The used barometric reduction method to calculate the ground pressure.
     * There are three different settings:
     *  - user offset
     *  - altimeter setting
     *  - NOAA bar reduction
     */
    public pressReductionMethod:
        | "user offset"
        | "altimeter setting"
        | "NOAA bar reduction"
        | null = null;

    /**
     * The used barometric reduction method encoded as number.
     * `0` is user offset, `1` is altimeter setting and `2` is NOAA bar reduction.
     */
    public pressReductionMethodID: 0 | 1 | 2 | null = null;

    /**
     * The user-entered barometric offset
     */
    public pressUserOffset: number | null = null;

    /**
     * The barometer calibration number
     */
    public pressCalibrationOffset: number | null = null;

    /**
     * The altimeter setting
     */
    public altimeter: number | null = null;

    /**
     * The measured heat index
     */
    public heat: number | null = null;

    /**
     * The calculated dew point
     */
    public dewpoint: number | null = null;

    /**
     * Average wind speed in the recent two minutes
     */
    public windAvg2m: number | null = null;

    /**
     * Speed of the heaviest gust in the recent 10 minutes
     */
    public windGust: number | null = null;

    /**
     * The heaviest wind gust's ({@link windGust}) direction encoded as string. Possible values are:
     * - NNE
     * - NE
     * - ENE
     * - E
     * - ESE
     * - SE
     * - SSE
     * - S
     * - SSW
     * - SW
     * - WSW
     * - W
     * - WNW
     * - NW
     * - NNW
     * - N
     */
    public windGustDir:
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
        | null
        | null = null;

    /**
     * The heaviest wind gust's ({@link windGust}) direction in degrees (from `1` to `360`).
     * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
     */
    public windGustDirDeg: number | null = null;

    /**
     * The current wind chill
     */
    public chill: number | null = null;

    /**
     * The currently measured THSW index. Requires a solar radiation sensor.
     */
    public thsw: number | null = null;

    /**
     * The amount of rain that has fallen in the recent 15 minutes
     */
    public rain15m: number | null = null;

    /**
     * The amount of rain that has fallen in the recent hour
     */
    public rain1h: number | null = null;

    /**
     * The amount of rain that has fallen in the recent 24 hours
     */
    public rain24h: number | null = null;

    /**
     * The current graph's pointers
     */
    public graphPointers = new GraphPointers();

    /**
     * Measured evapotranspiration (ET) of the day
     */
    public etDay: number | null = null;

    /**
     * The package type (always "LOOP2")
     */
    public packageType = LOOPPackageType.LOOP2 as const;
}
