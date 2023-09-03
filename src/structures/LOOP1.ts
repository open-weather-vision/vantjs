import { LOOPPackageType } from "./LOOPPackageType";
import SimpleRealtimeData from "./SimpleRealtimeData";
import AlarmData from "./subtypes/AlarmData";

/**
 * The older LOOP(1) package used by Rev "A" firmware (dated before April 24, 2002).
 * Newer weather stations support this package type too.
 */
export default class LOOP1 extends SimpleRealtimeData {
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
     * Measured evapotranspiration (ET) of the day
     */
    public etDay: number | null = null;

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
    public forecastID: 8 | 6 | 2 | 3 | 18 | 19 | 7 | 22 | 23 | null = null;

    /**
     * Not documented. Please create an issue on github if you know more about this.
     */
    public forecastRule: number | null = null;

    /**
     * Points to the next archive record
     */
    public nextArchiveRecord: number | null = null;

    /**
     * Current alarms states
     */
    public alarms = new AlarmData();

    /**
     * The transmitter's battery status (poorly documented)
     */
    public transmitterBatteryStatus: number | null = null;

    /**
     * The console's battery voltage
     */
    public consoleBatteryVoltage: number | null = null;

    /**
     * The today's sunrise time (e.g. `06:35`)
     */
    public sunrise: string | null = null;

    /**
     * The today's sunset time (e.g. `19:35`)
     */
    public sunset: string | null = null;

    /**
     * The package type (always `"LOOP1"`)
     */
    public packageType = LOOPPackageType.LOOP1 as const;
}
