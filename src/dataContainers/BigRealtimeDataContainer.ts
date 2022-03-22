import merge from "lodash.merge";
import VantPro2Interface from "../interfaces/VantPro2Interface";
import VantVueInterface from "../interfaces/VantVueInterface";
import createNullHighsAndLows from "../structures/createNullHighsAndLows";
import createNullRichRealtimeRecord from "../structures/createNullRichRealtimeRecord";
import { HighsAndLows } from "../structures/HighsAndLows";
import { DeviceModel } from "./DeviceModel";
import WeatherDataContainer, {
    MinimumWeatherDataContainerSettings,
} from "./WeatherDataContainer";
import { RichRealtimeRecord } from "../structures/RichRealtimeRecord";

export default class BigRealtimeDataContainer
    extends WeatherDataContainer<
        VantPro2Interface | VantVueInterface,
        DeviceModel.VantagePro2 | DeviceModel.VantageVue
    >
    implements RichRealtimeRecord
{
    public highsAndLows: HighsAndLows = createNullHighsAndLows();

    public pressure = {
        current: null as number | null,
        currentRaw: null as number | null,
        currentAbsolute: null as number | null,
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
        reductionMethod: {
            value: null as 0 | 1 | 2 | null,
            text: null as
                | "user offset"
                | "altimeter setting"
                | "NOAA bar reduction"
                | null,
        },
        userOffset: null as number | null,
        calibrationOffset: null as number | null,
    };

    public altimeter: number | null = null;

    public heat: number | null = null;

    public dewpoint: number | null = null;

    public temperature = {
        in: null as number | null,
        out: null as number | null,
        extra: [null, null, null, null, null, null, null] as [
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null
        ],
    };

    public leafTemps = [null, null, null, null] as [
        number | null,
        number | null,
        number | null,
        number | null
    ];

    public soilTemps = [null, null, null, null] as [
        number | null,
        number | null,
        number | null,
        number | null
    ];

    public humidity = {
        in: null as number | null,
        out: null as number | null,
        extra: [null, null, null, null, null, null, null] as [
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null
        ],
    };

    public wind = {
        current: null as number | null,
        avg: {
            tenMinutes: null as number | null,
            twoMinutes: null as number | null,
        },
        direction: null as number | null,
        heaviestGust10min: {
            direction: null as number | null,
            speed: null as number | null,
        },
        chill: null as number | null,
        thsw: null as number | null,
    };

    public rain = {
        rate: null as number | null,
        storm: null as number | null,
        stormStartDate: null as Date | null,
        day: null as number | null,
        month: null as number | null,
        year: null as number | null,
        last15min: null as number | null,
        lastHour: null as number | null,
        last24h: null as number | null,
    };

    public et = {
        day: null as number | null,
        month: null as number | null,
        year: null as number | null,
    };

    public soilMoistures = [null, null, null, null] as [
        number | null,
        number | null,
        number | null,
        number | null
    ];

    public leafWetnesses = [null, null, null, null] as [
        number | null,
        number | null,
        number | null,
        number | null
    ];

    public uv: number | null = null;

    public solarRadiation: number | null = null;

    public transmitterBatteryStatus: number | null = null;

    public consoleBatteryVoltage: number | null = null;

    public forecast = {
        iconNumber: null as 8 | 6 | 2 | 3 | 18 | 19 | 7 | 22 | 23 | null,
        iconText: null as
            | "Mostly Clear"
            | "Partly Cloudy"
            | "Mostly Cloudy"
            | "Mostly Cloudy, Rain within 12 hours"
            | "Mostly Cloudy, Snow within 12 hours"
            | "Mostly Cloudy, Rain or Snow within 12 hours"
            | "Partly Cloudy, Rain within 12 hours"
            | "Partly Cloudy, Rain or Snow within 12 hours"
            | "Partly Cloudy, Snow within 12 hours"
            | null,
        rule: null as number | null,
    };

    public sunrise: string | null = null;

    public sunset: string | null = null;

    public time: Date = new Date();

    public static async create(
        settings: MinimumWeatherDataContainerSettings<
            DeviceModel.VantagePro2 | DeviceModel.VantageVue
        >
    ) {
        return await this.initialize(new BigRealtimeDataContainer(), settings);
    }

    private constructor() {
        super();
    }

    protected onConnectionError = async () => {
        merge(this, createNullRichRealtimeRecord());
        this.highsAndLows = createNullHighsAndLows();
    };

    protected onUpdate = async (
        device: VantPro2Interface | VantVueInterface
    ) => {
        try {
            const richRealtimeRecord = await device.getRichRealtimeRecord();
            merge(this, richRealtimeRecord);
        } catch (err) {
            merge(this, createNullRichRealtimeRecord());
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
