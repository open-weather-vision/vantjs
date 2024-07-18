import merge from "lodash.merge";
import { HighsAndLows, BasicRealtimeData } from "vant-environment/structures";
import RealtimeDataContainer from "./RealtimeDataContainer.js";
import { MinimumRealtimeDataContainerSettings } from "./settings/MinimumRealtimeDataContainerSettings.js";
import WeatherStation from "../weather-station/WeatherStation.js";
import WeatherStationAdvanced from "../weather-station/WeatherStationAdvanced.js";

/**
 * The smaller version of the realtime data container providing {@link HighsAndLows} and {@link BasicRealtimeData}.
 * Works on any Vantage Vue, Pro and Pro 2.
 *
 * **What are realtime containers?**
 *
 * Realtime interfaces provide another level of abstraction to interact with your weather station. Instead of manually calling methods like
 * {@link WeatherStationAdvanced.getHighsAndLows} or {@link WeatherStationAdvanced.getDetailedRealtimeData}, you just access the attributes of an instance of this class.
 * E.g. to get the current outside temperature you just create a realtime interface and access it using `realtime.tempOut`.
 *
 * Internally this works via an update cycle. Every `container.settings.updateInterval` seconds the interface requests data from your weather station to update its attributes.
 * As the realtime interface is an [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter), you can listen to the `"update"` event. Additionally
 * there is the `"valid-update"` event which only fires if no error occurrs.
 */
export default class BasicRealtimeDataContainer
    extends RealtimeDataContainer<WeatherStation>
    implements BasicRealtimeData
{
    /**
     *  Holds daily, monthly and yearly highs and lows for all weather elements / sensors.
     */
    public highsAndLows: HighsAndLows = new HighsAndLows();

    /**
     * Current pressure
     */
    public press: number | null = null;

    /**
     * The pressure's trend. There are five possible trends:
     *  - Falling Rapidly
     *  - Falling Slowly
     *  - Steady
     *  - Rising Slowly
     *  - Rising Rapidly
     */
    public pressTrend:
        | "Falling Rapidly"
        | "Steady"
        | "Rising Rapidly"
        | "Rising Slowly"
        | "Falling Slowly"
        | null = null;

    /**
     * The pressure's trend encoded as number.
     *  - `-60` stands for *Falling Rapidly*
     *  - `-20` stands for *Falling Slowly*
     *  - `0` stands for *Steady*
     *  - `20` stands for *Rising Slowly*
     *  - `60` stands for *Rising Rapidly*
     */
    public pressTrendID: -60 | -20 | 0 | 20 | 60 | null = null;

    /** Current outside temperature */
    public tempOut: number | null = null;

    /** Current inside temperature (the console's temperature) */
    public tempIn: number | null = null;

    /**
     * Current inside humidity in percent
     */
    public humIn: number | null = null;

    /**
     * Current outside humidity in percent
     */
    public humOut: number | null = null;

    /**
     * Currently measured wind speed
     */
    public wind: number | null = null;

    /**
     * Average wind speed in the recent ten minutes
     */
    public windAvg10m: number | null = null;

    /**
     * Currently measured wind direction encoded as string. Possible values are:
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
    public windDir:
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
     * The wind speed direction in degrees (from `1` to `360`).
     * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
     */
    public windDirDeg: number | null = null;

    /**
     * The current rain rate
     */
    public rainRate: number | null = null;

    /**
     * The amount of rain that fell today
     */
    public rainDay: number | null = null;

    /**
     * The most recent rainstorm's amount of rain
     */
    public stormRain: number | null = null;

    /**
     * The most recent rainstorm's start date (without time)
     */
    public stormStartDate: Date | null = null;

    /**
     * Measured evapotranspiration (ET) of the day
     */
    public etDay: number | null = null;

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

    /**
     * Creates a new basic realtime data container.
     * 
     * It is not recommended to use the constructor directly, it is better to use the `.createBasicRealtimeDataContainer()` method of
     * the weather station as this avoids multiple instances (singleton).
     * 
     * @example
     * ```ts
     * const realtime = WeatherStation.connectBasicRealtimeDataContainer({
     *      updateInterval: 1,
     * });
     * await realtime.waitForUpdate();
     * 
     * console.log(`It's ${realtime.tempOut}°F outside!`);
     * realtime.pause();
     * ```
     * @param settings your desired settings
     * @returns the realtime data container
     */
    public constructor(
        settings: MinimumRealtimeDataContainerSettings,
        station: WeatherStation,
    ) {
        super(settings, station);
    }

    /**
     * Updates the small realtime interface. Merges a new BasicRealtimeData instance
     * into this and updates the highs and lows.
     * @param device
     */
    protected updateData = async () => {
        const [BasicRealtimeData, err1] = await this.station.getBasicRealtimeData();
        merge(this, BasicRealtimeData);

        const [highsAndLows, err2] = await this.station.getHighsAndLows();

        this.highsAndLows = highsAndLows;

        if(err1){
            throw err1;
        }
        if(err2){
            throw err2;
        }
    };
}
