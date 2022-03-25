import merge from "lodash.merge";
import VantPro2Interface from "../interfaces/VantPro2Interface";
import VantVueInterface from "../interfaces/VantVueInterface";
import HighsAndLows from "../structures/HighsAndLows";
import { DeviceModel } from "./DeviceModel";
import RealtimeDataContainer, {
    MinimumRealtimeDataContainerSettings,
} from "./RealtimeDataContainer";
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

    public highsAndLows = new HighsAndLows();

    public static async create(
        settings: MinimumRealtimeDataContainerSettings<
            DeviceModel.VantagePro2 | DeviceModel.VantageVue
        >
    ) {
        return await this.initialize(new BigRealtimeDataContainer(settings));
    }

    private constructor(
        settings: MinimumRealtimeDataContainerSettings<
            DeviceModel.VantagePro2 | DeviceModel.VantageVue
        >
    ) {
        super(settings);
    }

    protected onConnectionError = async () => {
        merge(this, new RichRealtimeData());
        this.highsAndLows = new HighsAndLows();
    };

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
