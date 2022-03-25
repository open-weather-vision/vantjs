import {
    SimpleHumidityData,
    SimplePressureData,
    SimpleRainData,
    SimpleTemperatureData,
    SimpleWindData,
} from "./subtypes";

/**
 * Contains basic realtime weather data. Works regardless of the weather station model (Vue, Pro, Pro 2).
 */
export default class SimpleRealtimeData {
    /**
     * Currently measured pressure related weather data
     */
    public pressure = new SimplePressureData();
    /**
     * Current inside and outside temperature
     */
    public temperature = new SimpleTemperatureData();

    /** Current inside and outside humidity (relative) in percent  */
    public humidity = new SimpleHumidityData();

    /** Currently measured wind related data */
    public wind = new SimpleWindData();
    /**
     *  Curently measured rain related data
     */
    public rain = new SimpleRainData();
    /**
     * Measured evapotranspiration (ET) of the day
     */
    public et: number | null = null;
    /**
     * Currently measured UV index
     */
    public uv: number | null = null;

    /**
     * Currently measured solar radiation
     */
    public solarRadiation: number | null = null;

    /**
     * The time the record was created
     */
    public time: Date = new Date();
}
