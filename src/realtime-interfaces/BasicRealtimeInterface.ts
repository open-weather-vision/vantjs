import merge from "lodash.merge";
import { HighsAndLows, BasicRealtimeData } from "vant-environment/structures";
import RealtimeInterface from "./RealtimeInterface";
import { MinimumRealtimeInterfaceSettings } from "./settings/MinimumRealtimeInterfaceSettings";
import { WeatherStation } from "../weather-station";

/**
 * The smaller version of the realtime interface providing {@link HighsAndLows} and {@link SimpleRealtimeData}.
 * Works on any Vantage Vue, Pro and Pro 2.
 *
 * **What are realtime interfaces?**
 *
 * Realtime interfaces provide another level of abstraction to interact with your weather station. Instead of manually calling methods like
 * {@link WeatherStationAdvanced.getHighsAndLows} or {@link WeatherStationAdvanced.getDetailedRealtimeData}, you just access the attributes of an instance of this class.
 * E.g. to get the current outside temperature you just create a realtime interface and access it using `realtime.tempOut`.
 *
 * Internally this works via an update cycle. Every `container.settings.updateInterval` seconds the interface requests data from your weather station to update its attributes.
 * As the realtime interface is an [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter), you can listen to the `"update"` event. Additionally
 * there is the `"valid-update"` event which only fires if no error occurrs.
 */
export default class BasicRealtimeInterface
    extends RealtimeInterface<WeatherStation>
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
     * Connects the realtime data container with your weather station.
     * 
     * @example
     * ```ts
     * const realtime = await BasicRealtimeInterface.connect({...});
     * await realtime.waitForUpdate();
     * 
     * console.log(`It's ${realtime.tempOut}°F outside!`);
     * ```
     * @param settings your desired settings
     * @returns the connected realtime data container
     * 
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console closes suddenly
     * - {@link FailedToWakeUpError} if the interface failed to wake up the console
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public static connect = async (settings: MinimumRealtimeInterfaceSettings) => {
        const device = await WeatherStation.connect(settings);
        return new BasicRealtimeInterface(settings, device);
    }

    /**
     * Creates a new instance of the small realtime container and sets the settings. Doesn't perform the {@link OnContainerCreate} action.
     * @param settings
     */
    private constructor(
        settings: MinimumRealtimeInterfaceSettings,
        device: WeatherStation,
    ) {
        super(settings, device, false);
    }

    /**
     * Updates the small realtime interface. Merges a new SimpleRealtimeData instance
     * into this and updates the highs and lows.
     * @param device
     */
    protected updateData = async () => {
        const [simpleRealtimeData, err1] = await this.device.getBasicRealtimeData();
        merge(this, simpleRealtimeData);

        const [highsAndLows, err2] = await this.device.getHighsAndLows();

        this.highsAndLows = highsAndLows;

        if(err1){
            throw err1;
        }
        if(err2){
            throw err2;
        }
    };
}
