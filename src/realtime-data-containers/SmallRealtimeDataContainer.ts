import merge from "lodash.merge";
import VantInterface from "../interfaces/VantInterface";
import { HighsAndLows, SimpleRealtimeData } from "vant-environment/structures";
import { DeviceModel } from "./settings/DeviceModel";
import RealtimeDataContainer from "./RealtimeDataContainer";
import { MinimumRealtimeDataContainerSettings } from "./settings/MinimumRealtimeDataContainerSettings";

/**
 * The smaller version of the realtime data container providing {@link HighsAndLows} and {@link SimpleRealtimeData}.
 * Works on Vantage Vue, Pro and Pro 2.
 *
 * **What are realtime data containers?**
 *
 * Realtime data containers provide another level of abstraction to interact with your weather station. Instead of manually calling methods like
 * {@link VantInterface.getHighsAndLows} or {@link VantInterface.getSimpleRealtimeData}, you just access the properties of an instance of this class.
 * E.g. to get the current outside temperature you just create a realtime data container and access it using `container.tempOut`.
 *
 * Internally this works via an update cycle. Every `container.settings.updateInterval` seconds the container uses an {@link VantInterface} to update its properties.
 * As the realtime data container is an [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter), you can listen to the `"update"` event. Additionally
 * there is the `"valid-update"` event which only fires if no error occurrs. To get an overview of all fired events take a look at {@link RealtimeDataContainerEvents}.
 *
 * Realtime data containers provide **another level of stability**. If the console disconnects from your computer the realtime data container stays alive waiting
 * for the console to reconnect.
 */
export default class SmallRealtimeDataContainer
    extends RealtimeDataContainer<
        VantInterface,
        | DeviceModel.VantagePro
        | DeviceModel.VantagePro2
        | DeviceModel.VantageVue
    >
    implements SimpleRealtimeData
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
     * Creates a small realtime container using the passed settings. Your device should be connected serially.
     * @param settings the container's settings
     */
    public static async create(
        settings: MinimumRealtimeDataContainerSettings<DeviceModel>
    ) {
        return await this.performOnCreateAction(
            new SmallRealtimeDataContainer(settings)
        );
    }

    /**
     * Creates a new instance of the small realtime container and sets the settings. Doesn't perform the {@link OnContainerCreate} action.
     * @param settings
     */
    private constructor(
        settings: MinimumRealtimeDataContainerSettings<DeviceModel>
    ) {
        super(settings);
    }

    /**
     * Sets all sensor values to `null`.
     */
    protected onConnectionError = async () => {
        merge(this, new SimpleRealtimeData());
        this.highsAndLows = new HighsAndLows();
    };

    /**
     * Updates the small realtime data container. Merges a new SimpleRealtimeData instance
     * into this and updates the highs and lows.
     * @param device
     */
    protected onUpdate = async (device: VantInterface) => {
        try {
            const simpleRealtimeData = await device.getSimpleRealtimeData();
            merge(this, simpleRealtimeData);
        } catch (err) {
            merge(this, new SimpleRealtimeData());
            throw err;
        }

        try {
            this.highsAndLows = await device.getHighsAndLows();
        } catch (err) {
            this.highsAndLows = new HighsAndLows();
            throw err;
        }
    };
}
