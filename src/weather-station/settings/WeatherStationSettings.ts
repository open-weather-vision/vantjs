import { UnitSettings } from "vant-environment/units";
import { BaudRate, RainCollectorSize } from "vant-environment/structures";
import WeatherStation from "../WeatherStation.js";

/**
 * Settings for the {@link WeatherStation}. {@link MinimumWeatherStationSettings} describes the minimum required settings to be configured when creating a {@link WeatherStation}.
 */
export interface WeatherStationSettings {
    /**
     * The used (serial) path to communicate with your weather station. On windows devices paths usually start with `COM` followed by the port number, on linux/osx
     * common paths start with `/dev/tty` followed by the port number.
     */
    readonly path: string;

    /**
     * The used baud rate. Adjustable in the vantage console. Default is `19200` other
     * options are `1200`, `2400`, `4800`, `9600` and `14400`.
     */
    readonly baudRate: BaudRate;

    /**
     * The weather station's collector size. See {@link RainCollectorSize}.
     */
    readonly rainCollectorSize: RainCollectorSize;

    /**
     * Configures the units to use. Doesn't have to match the units displayed on your console. See {@link UnitSettings}.
     */
    readonly units: UnitSettings;

    /**
     * Specifies the interval between every reconnection try in `ms`. Default is `1000`.
     */
    readonly reconnectionInterval: number;

    /**
     * Specifies the default maximum time _vantjs_ waits for a weather station package. `undefined` disables timeouts (by default). Default is `1000`.
     */
    readonly defaultTimeout?: number;
}
