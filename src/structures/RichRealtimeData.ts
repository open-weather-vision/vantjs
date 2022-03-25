import {
    RichHumidityData,
    RichPressureData,
    RichTemperatureData,
    RichWindData,
    RichRainData,
    RichETData,
    ForecastData,
} from "./subtypes";

/**
 * Contains a lot of useful realtime weather data. Only works on Vantage Vue and Vantage Pro 2.
 */
export default class RichRealtimeData {
    /**
     * Currently measured pressure related weather data
     */
    public pressure = new RichPressureData();

    /**
     * The measured heat index
     */
    public heat: number | null = null;

    /**
     * The calculated dew point
     */
    public dewpoint: number | null = null;

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
    public wind = new RichWindData();

    /**
     * The currently measured THSW index. Requires a solar radiation sensor.
     */
    public thsw: number | null = null;

    /**
     *  Curently measured rain related data
     */
    public rain = new RichRainData();

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
     * The time the record was created
     */
    public time: Date = new Date();
}
