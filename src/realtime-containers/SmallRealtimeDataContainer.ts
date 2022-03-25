import merge from "lodash.merge";
import VantInterface from "../interfaces/VantInterface";
import HighsAndLows from "../structures/HighsAndLows";
import { DeviceModel } from "./DeviceModel";
import RealtimeDataContainer, {
    MinimumRealtimeDataContainerSettings,
} from "./RealtimeDataContainer";
import { SimpleRealtimeData } from "../structures";
import {
    SimpleHumidityData,
    SimplePressureData,
    SimpleRainData,
    SimpleTemperatureData,
    SimpleWindData,
} from "../structures/subtypes";

export default class SmallRealtimeDataContainer
    extends RealtimeDataContainer<
        VantInterface,
        | DeviceModel.VantagePro
        | DeviceModel.VantagePro2
        | DeviceModel.VantageVue
    >
    implements SimpleRealtimeData
{
    public highsAndLows: HighsAndLows = new HighsAndLows();

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

    public static async create(
        settings: MinimumRealtimeDataContainerSettings<DeviceModel>
    ) {
        return await this.initialize(new SmallRealtimeDataContainer(settings));
    }

    private constructor(
        settings: MinimumRealtimeDataContainerSettings<DeviceModel>
    ) {
        super(settings);
    }

    protected onConnectionError = async () => {
        merge(this, new SimpleRealtimeData());
        this.highsAndLows = new HighsAndLows();
    };
    protected onUpdate = async (device: VantInterface) => {
        try {
            const simpleRealtimeRecord = await device.getSimpleRealtimeData();
            merge(this, simpleRealtimeRecord);
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
