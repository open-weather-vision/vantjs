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

    /**
     * Currently measured pressure related weather data
     */
    public pressure = {
        /** Current pressure in inch */
        current: null as number | null,

        /**
         * The pressure's trend. There are five possible trends:
         *  - Falling Rapidly
         *  - Falling Slowly
         *  - Steady
         *  - Rising Slowly
         *  - Rising Rapidly
         *
         * `trend.value` encodes them as number, `trend.text` as string.
         */
        trend: {
            /**
             * The pressure's trend encoded as number.
             *  - `-60` stands for *Falling Rapidly*
             *  - `-20` stands for *Falling Slowly*
             *  - `0` stands for *Steady*
             *  - `20` stands for *Rising Slowly*
             *  - `60` stands for *Rising Rapidly*
             */
            value: null as -60 | -20 | 0 | 20 | 60 | null,

            /**
             * The pressure's trend encoded as string.
             * Possible values are `"Falling Rapidly"`, `"Falling Slowly"`, `"Steady"`, `"Rising Slowly"` and `"Rising Rapidly"`.
             */
            text: null as
                | "Falling Rapidly"
                | "Steady"
                | "Rising Rapidly"
                | "Rising Slowly"
                | "Falling Slowly"
                | null,
        },
    };

    /**
     * Current inside and outside temperature in °F
     */
    public temperature = {
        /** Current inside temperature in °F */
        in: null as number | null,
        /** Current outside temperature in °F */
        out: null as number | null,
    };

    /** Current inside and outside humidity (relative) in percent  */
    public humidity = {
        /** Current inside humidity (relative) in percent */
        in: null as number | null,
        /** Current outside humidity (relative) in percent */
        out: null as number | null,
    };

    public wind = {
        current: null as number | null,
        avg: null as number | null,
        direction: {
            degrees: null as number | null,
            abbrevation: null as
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
                | null,
        },
    };

    public rain = {
        rate: null as number | null,
        storm: null as number | null,
        stormStartDate: null,
        day: null as number | null,
    };

    public et = null as number | null;

    public uv = null as number | null;

    public solarRadiation = null as number | null;

    public time: Date = new Date();

    public static async create(
        settings: MinimumWeatherDataContainerSettings<DeviceModel>
    ) {
        return await this.initialize(new SmallRealtimeDataContainer(settings));
    }

    private constructor(
        settings: MinimumWeatherDataContainerSettings<DeviceModel>
    ) {
        super(settings);
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
