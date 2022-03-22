import VantInterface from "../interfaces/VantInterface";
import createNullHighsAndLows from "../structures/createNullHighsAndLows";
import { HighsAndLows } from "../structures/HighsAndLows";
import { DeviceModel } from "./DeviceModel";
import WeatherDataContainer, {
    MinimumWeatherDataContainerSettings,
} from "./WeatherDataContainer";
import { SimpleRealtimeRecord } from "../structures/SimpleRealtimeRecord";
import merge from "lodash.merge";
import createNullSimpleRealtimeRecord from "../structures/createNullSimpleRealtimeRecord";

export default class SmallRealtimeDataContainer
    extends WeatherDataContainer<
        VantInterface,
        | DeviceModel.VantagePro
        | DeviceModel.VantagePro2
        | DeviceModel.VantageVue
    >
    implements SimpleRealtimeRecord
{
    public highsAndLows: HighsAndLows = createNullHighsAndLows();

    public pressure = {
        current: null as number | null,
        trend: {
            value: null as -60 | -20 | 0 | 20 | 60 | null,
            text: null as
                | "Falling Rapidly"
                | "Steady"
                | "Rising Rapidly"
                | "Rising Slowly"
                | "Falling Slowly"
                | null,
        },
    };

    public temperature = {
        in: null as number | null,
        out: null as number | null,
    };

    public humidity = {
        in: null as number | null,
        out: null as number | null,
    };

    public wind = {
        current: null as number | null,
        avg: null as number | null,
        direction: null as number | null,
    };

    public rain = {
        rate: null as number | null,
        storm: null as number | null,
        stormStartDate: null,
        day: null as number | null,
    };

    public et = { day: null as number | null };

    public uv = null as number | null;

    public solarRadiation = null as number | null;

    public time: Date = new Date();

    public static async create(
        settings: MinimumWeatherDataContainerSettings<DeviceModel>
    ) {
        return await this.initialize(
            new SmallRealtimeDataContainer(),
            settings
        );
    }

    private constructor() {
        super();
    }

    protected onConnectionError = async () => {
        merge(this, createNullSimpleRealtimeRecord());
        this.highsAndLows = createNullHighsAndLows();
    };
    protected onUpdate = async (device: VantInterface) => {
        try {
            const simpleRealtimeRecord = await device.getSimpleRealtimeRecord();
            merge(this, simpleRealtimeRecord);
        } catch (err) {
            merge(this, createNullSimpleRealtimeRecord());
            throw err;
        }

        try {
            this.highsAndLows = await device.getHighsAndLows();
        } catch (err) {
            this.highsAndLows = createNullHighsAndLows();
            throw err;
        }
    };
}
