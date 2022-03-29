import LOOP1 from "./LOOP1";
import LOOP2 from "./LOOP2";
import SimpleRealtimeData from "./SimpleRealtimeData";

/**
 * Contains a lot of useful realtime weather data. Only works on Vantage Vue and Vantage Pro 2 (having firmware dated after April 24, 2002 / v1.90 or above).
 */
export default class RichRealtimeData
    extends SimpleRealtimeData
    implements
        Omit<LOOP1, "nextArchiveRecord" | "packageType" | "alarms">,
        Omit<LOOP2, "packageType" | "graphPointers">
{
    /**
     * Measured extra temperatures (from up to 7 sensors)
     */
    public tempExtra: [
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null, null, null, null];

    /**
     * Measured leaf temperatures (from up to 4 sensors)
     */
    public leafTemps: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Measured soil temperatures (from up to 4 sensors)
     */
    public soilTemps: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Measured extra humidities (from up to 7 sensors)
     */
    public humExtra: [
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null, null, null, null];

    /**
     * The amount of rain that has fallen in this month
     */
    public rainMonth: number | null = null;

    /**
     * The amount of rain that has fallen in this year
     */
    public rainYear: number | null = null;

    /**
     * Measured evapotranspiration (ET) in the current month
     */
    public etMonth: number | null = null;

    /**
     * Measured evapotranspiration (ET) in the current year
     */
    public etYear: number | null = null;

    /**
     * Measured soil moisture from up to 4 sensors
     */
    public soilMoistures: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Measured leaf wetness from up to 4 sensors
     */
    public leafWetnesses: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Current forecast computed by the connected vantage console
     *
     * There are the following options:
     * - Sun
     * - Partly Cloudy
     * - Mostly Cloudy
     * - Mostly Cloudy, Rain within 12 hours
     * - Mostly Cloudy, Snow within 12 hours
     * - Partly Cloudy, Rain or Snow within 12 hours
     * - Partly Cloudy, Rain within 12 hours
     * - Partly Cloudy, Snow within 12 hours
     * - Partly Cloudy, Rain or Snow within 12 hours
     */
    public forecast:
        | "Mostly Clear"
        | "Partly Cloudy"
        | "Mostly Cloudy"
        | "Mostly Cloudy, Rain within 12 hours"
        | "Mostly Cloudy, Snow within 12 hours"
        | "Mostly Cloudy, Rain or Snow within 12 hours"
        | "Partly Cloudy, Rain within 12 hours"
        | "Partly Cloudy, Rain or Snow within 12 hours"
        | "Partly Cloudy, Snow within 12 hours"
        | null = null;

    /**
     * The calculated forecast encoded as number:
     * - `8` => Mostly Clear
     * - `6` => Partly Cloudy
     * - `2` => Mostly Cloudy
     * - `3` => Mostly Cloudy, Rain within 12 hours
     * - `18` => Mostly Cloudy, Snow within 12 hours
     * - `19` => Partly Cloudy, Rain or Snow within 12 hours
     * - `7` => Partly Cloudy, Rain within 12 hours
     * - `22` => Partly Cloudy, Snow within 12 hours
     * - `23` => Partly Cloudy, Rain or Snow within 12 hours
     */
    public forecastID: 7 | 8 | 6 | 2 | 3 | 18 | 19 | 22 | 23 | null = null;

    /**
     * Not documented. Please create an issue on github if you know more about this.
     */
    public forecastRule: number | null = null;

    /**
     * The transmitter's battery status (poorly documented)
     */
    public transmitterBatteryStatus: number | null = null;

    /**
     * The console's battery voltage
     */
    public consoleBatteryVoltage: number | null = null;

    /**
     * The today's sunrise time (e.g. `"06:35"`)
     */
    public sunrise: string | null = null;

    /**
     * The today's sunset time (e.g. `"19:35"`)
     */
    public sunset: string | null = null;

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
}
