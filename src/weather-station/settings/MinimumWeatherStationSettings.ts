import { BaudRate, RainCollectorSize } from "vant-environment/structures";
import { UnitConfiguration } from "vant-environment/units";

/**
 * The minimum required settings for any vant interface.
 */
export interface MinimumWeatherStationSettings {
    /**
     * **Required**. The used (serial) path to communicate with your weather station. On windows devices paths usually start with `COM` followed by the port number, on linux/osx
     * common paths start with `/dev/tty` followed by the port number.
     */
    readonly path: string;

    /**
     * **Optional**. The used baud rate. Adjustable in the vantage console. Default is `19200`, other
     * options are `1200`, `2400`, `4800`, `9600` and `14400`.
     */
    readonly baudRate?: BaudRate;

    /**
     * **Required**. The weather station's collector size. See {@link RainCollectorSize}.
     */
    readonly rainCollectorSize: RainCollectorSize;

    /**
     * **Optional**. Configures the units to use. Doesn't have to match the units displayed on your console. Your weather data gets converted automatically.
     */
    readonly units?: Partial<UnitConfiguration>;

    /**
     * **Optional**: Specifies the interval between every reconnection try in `ms`. Default is `1000`.
     */
    readonly reconnectionInterval?: number;

    /**
     * **Optional**: Specifies the default maximum time in milliseconds _vantjs_ waits for a weather station package. `undefined` disables timeouts (by default). Default is `1000`.
     */
    readonly defaultTimeout?: number;
}
