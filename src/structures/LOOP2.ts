import { LOOPPackageType } from "./LOOPPackageType";
import GraphPointers from "./subtypes/GraphPointers";
import RainData2 from "./subtypes/RainData2";
import RichPressureData from "./subtypes/RichPressureData";
import RichWindData from "./subtypes/RichWindData";
import SimpleETData from "./subtypes/SimpleETData";
import SimpleHumidityData from "./subtypes/SimpleHumidityData";
import SimpleTemperatureData from "./subtypes/SimpleTemperatureData";

/**
 * The newer LOOP2 package used by Rev "B" firmware (dated after April 24, 2002 / Firmware 1.90^).
 * Older weather stations don't support this package type. The Vantage Pro doesn't support this package at all.
 */
export default class LOOP2 {
    /**
     * @hidden
     */
    constructor() {}

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
     * Current inside and outside temperature
     */
    public temperature = new SimpleTemperatureData();

    /** Current inside and outside humidity (relative) in percent  */
    public humidity = new SimpleHumidityData();

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
    public rain = new RainData2();

    /**
     * Evotranspiration (ET) related data
     */
    et = new SimpleETData();
    /**
     * The current UV index
     */
    uv: number | null = null;
    /**
     * The current solar radiation
     */
    solarRadiation: number | null = null;
    /**
     * The current graph's pointers
     */
    graphPointers = new GraphPointers();

    /**
     * The package type (always "LOOP2")
     */
    public packageType = LOOPPackageType.LOOP2 as const;
}
