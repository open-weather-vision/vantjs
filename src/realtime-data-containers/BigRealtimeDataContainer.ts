import merge from "lodash.merge";
import VantPro2Interface from "../interfaces/VantPro2Interface";
import VantVueInterface from "../interfaces/VantVueInterface";
import HighsAndLows from "../structures/HighsAndLows";
import { DeviceModel } from "./settings/DeviceModel";
import RealtimeDataContainer from "./RealtimeDataContainer";
import RichRealtimeData from "../structures/RichRealtimeData";
import {
    ForecastData,
    RichETData,
    RichHumidityData,
    RichPressureData,
    RichRainData,
    RichTemperatureData,
    RichWindData,
} from "../structures/subtypes";
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
 * Internally this works via an update cycle. Every `container.settings.updateInterval` seconds the container uses a interface to update its properties.
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

    /**
     * Holds daily, monthly and yearly highs and lows for all weather elements / sensors.
     */
    public highsAndLows = new HighsAndLows();

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
