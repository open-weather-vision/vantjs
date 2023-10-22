import { UnitSettings } from "vant-environment/units";
import { BaudRate, RainCollectorSize } from "vant-environment/structures";

/**
 * Settings for the {@link VantInterface}. {@link MinimumVantInterfaceSettings} describes the minimum required settings to be configured when creating a {@link VantInterface}.
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
     * Defines the interface's behaviour if the serial connection is lost (because of an error).
     * 
     * _Imagine following scenario_:
     * 
     * Your console is connected serially to your computer. Your program is **already running and connected** to the weather station.
     * Now you **unplug** your weather station. The program _wont't crash_, _vantjs_ can handle this situation.
     * If your program is now requesting data from the weather station (e.g. via `await device.getSimpleRealtimeData()`),
     * _vantjs_ will recognize, that it has lost the connection to the console.
     * It automatically tries to reconnect. Depending on this setting your program acts different. 
     * 
     * If you set `disconnectionBehaviour` to
     * `"WAIT_UNTIL_RECONNECTED"` _vantjs_ first repeatedly tries to reconnect (your program pauses until you plug the weather station in again) and after that returns the requested weather data.
     * 
     * If you choose `"RETURN_ERROR"` _vantjs_ will return a {@link ClosedConnectionError} as second element in the result array, and tries to reconnect in the background.
     * 
     * Default is `"WAIT_UNTIL_RECONNECTED"`.
     */
    readonly disconnectionBehaviour: "WAIT_UNTIL_RECONNECTED" | "RETURN_ERROR";
}
