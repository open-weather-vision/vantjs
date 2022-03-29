import merge from "lodash.merge";
import VantInterface from "../interfaces/VantInterface";
import HighsAndLows from "../structures/HighsAndLows";
import { DeviceModel } from "./settings/DeviceModel";
import RealtimeDataContainer from "./RealtimeDataContainer";
import { SimpleRealtimeData } from "../structures";
import { MinimumRealtimeDataContainerSettings } from "./settings/MinimumRealtimeDataContainerSettings";

/**
 * The smaller version of the realtime data container providing {@link HighsAndLows} and {@link SimpleRealtimeData}.
 * Works on Vantage Vue, Pro and Pro 2.
 *
 * **What are realtime data containers?**
 *
 * Realtime data containers provide another level of abstraction to interact with your weather station. Instead of manually calling methods like
 * {@link VantInterface.getHighsAndLows} or {@link VantInterface.getSimpleRealtimeData}, you just access the properties of an instance of this class.
 * E.g. to get the current outside temperature you just create a realtime data container and access it using `container.temperature.out`.
 *
 * Internally this works via an update cycle. Every `container.settings.updateInterval` seconds the container uses an {@link VantInterface} to update its properties.
 * As the realtime data container is an [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter), you can listen to the `"update"` event. Additionally
 * there is the `"valid-update"` event which only fires if no error occurrs. To get an overview of all fired events take a look at {@link RealtimeDataContainerEvents this}.
 *
 * Realtime data containers provide another level of stability. If the console disconnects from your computer the realtime data container stays alive waiting
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

    public press: number | null = null;
    public pressTrend:
        | "Falling Rapidly"
        | "Steady"
        | "Rising Rapidly"
        | "Rising Slowly"
        | "Falling Slowly"
        | null = null;
    public pressTrendID: 0 | 60 | -60 | 20 | -20 | null = null;
    public tempOut: number | null = null;
    public tempIn: number | null = null;
    public humIn: number | null = null;
    public humOut: number | null = null;
    public wind: number | null = null;
    public windAvg10m: number | null = null;
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
        | null = null;
    public windDirDeg: number | null = null;
    public rainRate: number | null = null;
    public rainDay: number | null = null;
    public stormRain: number | null = null;
    public stormStartDate: Date | null = null;
    public etDay: number | null = null;
    public uv: number | null = null;
    public solarRadiation: number | null = null;
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
