import { OnInterfaceCreate } from "./OnInterfaceCreate";
import { UnitSettings } from "vant-environment/units";
import { BaudRate, RainCollectorSize } from "vant-environment";

/**
 * Settings for the {@link VantInterface}. {@link MinimumVantInterfaceSettings} describes the minimum required settings to be configured when creating a {@link VantInterface}.
 */
export interface VantInterfaceSettings {
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
     * The action to perform automatically on creating an interface. See {@link OnCreate}.
     */
    readonly onCreate: OnInterfaceCreate;

    /**
     * The weather station's collector size. See {@link RainCollectorSize}.
     */
    readonly rainCollectorSize: RainCollectorSize;

    /**
     * Configures the units to use. Doesn't have to match the units displayed on your console. See {@link UnitSettings}.
     */
    readonly units: UnitSettings;
}
