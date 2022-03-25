import { LOOPPackageType } from "./LOOPPackageType";
import AlarmData from "./subtypes/AlarmData";
import ForecastData from "./subtypes/ForecastData";
import RainData1 from "./subtypes/RainData1";
import RichETData from "./subtypes/RichETData";
import RichHumidityData from "./subtypes/RichHumidityData";
import RichTemperatureData from "./subtypes/RichTemperatureData";
import SimplePressureData from "./subtypes/SimplePressureData";
import SimpleWindData from "./subtypes/SimpleWindData";

/**
 * The older LOOP(1) package used by Rev "A" firmware (dated before April 24, 2002).
 * Newer weather stations support this package type too.
 */
export default class LOOP1 {
    /**
     * @hidden
     */
    constructor() {}

    /**
     * Holds the current pressure and the pressure's trend
     */
    public pressure = new SimplePressureData();

    /**
     * The currently measured temperatures
     */
    public temperature = new RichTemperatureData();

    /**
     * Currently measured leaf temperatures (from up to 4 sensors)
     */
    public leafTemps: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Currently measured soil temperatures (from up to 4 sensors)
     */
    public soilTemps: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Currently measured (relative) humidities in percent
     */
    public humidity = new RichHumidityData();

    /**
     * Wind related realtime data
     */
    public wind = new SimpleWindData();

    /**
     *  Curently measured rain related data
     */
    public rain = new RainData1();

    /**
     * Evotranspiration (ET) related data
     */
    public et = new RichETData();

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
     * The current UV index
     */
    public uv: number | null = null;

    /**
     * The current solar radiation
     */
    public solarRadiation: number | null = null;

    /**
     * Points to the next archive record
     */
    public nextArchiveRecord: string | null = null;

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
     * The calculated forecast. `forecast.iconNumber` encodes it as `number`, `forecast.iconText` as `string`.
     */
    public forecast = new ForecastData();

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
