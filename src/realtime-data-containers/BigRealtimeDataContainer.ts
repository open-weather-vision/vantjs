import merge from "lodash.merge";
import VantPro2Interface from "../interfaces/VantPro2Interface";
import VantVueInterface from "../interfaces/VantVueInterface";
import HighsAndLows from "../structures/HighsAndLows";
import { DeviceModel } from "./settings/DeviceModel";
import RealtimeDataContainer from "./RealtimeDataContainer";
import RichRealtimeData from "../structures/RichRealtimeData";
import { MinimumRealtimeDataContainerSettings } from "./settings/MinimumRealtimeDataContainerSettings";

/**
 * The bigger version of the realtime data container providing {@link HighsAndLows} and {@link RichRealtimeData}.
 * Only works on Vantage Pro 2 and Vue (having firmware dated after April 24, 2002 / v1.90 or above).
 *
 * **What are realtime data containers?**
 *
 * Realtime data containers provide another level of abstraction to interact with your weather station. Instead of manually calling methods like
 * {@link VantInterface.getHighsAndLows} or {@link VantPro2Interface.getRichRealtimeData}, you just access the properties of an instance of this class.
 * E.g. to get the current outside temperature you just create a realtime data container and access it using `container.temperature.out`.
 *
 * Internally this works via an update cycle. Every `container.settings.updateInterval` seconds the container uses an interface to update its properties.
 * As the realtime data container is an [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter), you can listen to the `"update"` event. Additionally
 * there is the `"valid-update"` event which only fires if no error occurrs.
 *
 * Realtime data containers provide another level of stability. If the console disconnects from your computer the realtime data container stays alive waiting
 * for the console to reconnect.
 */
export default class BigRealtimeDataContainer
    extends RealtimeDataContainer<
        VantPro2Interface | VantVueInterface,
        DeviceModel.VantagePro2 | DeviceModel.VantageVue
    >
    implements RichRealtimeData
{
    /**
     * The time the record was created
     */
    public time: Date = new Date();

    /**
     * Holds daily, monthly and yearly highs and lows for all weather elements / sensors.
     */
    public highsAndLows = new HighsAndLows();

    public tempExtra: [
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null, null, null, null];
    public leafTemps: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];
    public soilTemps: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];
    public humExtra: [
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null, null, null, null];
    public rainMonth: number | null = null;
    public rainYear: number | null = null;
    public etMonth: number | null = null;
    public etYear: number | null = null;
    public soilMoistures: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];
    public leafWetnesses: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];
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
    public forecastID: 7 | 8 | 6 | 2 | 3 | 18 | 19 | 22 | 23 | null = null;
    public forecastRule: number | null = null;
    public transmitterBatteryStatus: number | null = null;
    public consoleBatteryVoltage: number | null = null;
    public sunrise: string | null = null;
    public sunset: string | null = null;
    public pressRaw: number | null = null;
    public pressAbs: number | null = null;
    public pressReductionMethod:
        | "user offset"
        | "altimeter setting"
        | "NOAA bar reduction"
        | null = null;
    public pressReductionMethodID: 0 | 2 | 1 | null = null;
    public pressUserOffset: number | null = null;
    public pressCalibrationOffset: number | null = null;
    public altimeter: number | null = null;
    public heat: number | null = null;
    public dewpoint: number | null = null;
    public windAvg2m: number | null = null;
    public windGust: number | null = null;
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
        | null = null;
    public windGustDirDeg: number | null = null;
    public chill: number | null = null;
    public thsw: number | null = null;
    public rain15m: number | null = null;
    public rain1h: number | null = null;
    public rain24h: number | null = null;
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

    /**
     * Creates a small realtime container using the passed settings. Your device should be connected serially.
     * @param settings the container's settings
     */
    public static async create(
        settings: MinimumRealtimeDataContainerSettings<
            DeviceModel.VantagePro2 | DeviceModel.VantageVue
        >
    ) {
        return await this.performOnCreateAction(
            new BigRealtimeDataContainer(settings)
        );
    }

    /**
     * Creates a new instance of the big realtime container and sets the settings. Doesn't perform the {@link OnContainerCreate} action.
     * @param settings
     */
    private constructor(
        settings: MinimumRealtimeDataContainerSettings<
            DeviceModel.VantagePro2 | DeviceModel.VantageVue
        >
    ) {
        super(settings);
    }

    /**
     * Sets all sensor values to `null`.
     */
    protected onConnectionError = async () => {
        merge(this, new RichRealtimeData());
        this.highsAndLows = new HighsAndLows();
    };

    /**
     * Updates the big realtime data container. Merges a new RichRealtimeData instance
     * into this and updates the highs and lows.
     * @param device
     */
    protected onUpdate = async (
        device: VantPro2Interface | VantVueInterface
    ) => {
        try {
            const richRealtimeRecord = await device.getRichRealtimeData();
            merge(this, richRealtimeRecord);
        } catch (err) {
            merge(this, new RichRealtimeData());
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
