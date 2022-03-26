import { OnInterfaceCreate } from "./OnInterfaceCreate";
import { RainCollectorSize } from "./RainCollectorSize";
import { UnitSettings } from "../../units/UnitSettings";

/**
 * The minimum required settings for any vant interface.
 */
export interface MinimumVantInterfaceSettings {
    /**
     * **Required**. The used (serial) path to communicate with your weather station. On windows devices paths usually start with `COM` followed by the port number, on linux/osx
     * common paths start with `/dev/tty` followed by the port number.
     */
    readonly path: string;

    /**
     * **Optional**. The used baud rate. Adjustable in the vantage console. Default is `19200`, other
     * options are `1200`, `2400`, `4800`, `9600` and `14400`.
     */
    readonly baudRate?: number;

    /**
     * **Optional**. The action to perform automatically on creating the interface. See {@link OnInterfaceCreate}.
     * Default is {@link OnInterfaceCreate.OpenAndWakeUp}.
     */
    readonly onCreate?: OnInterfaceCreate;

    /**
     * **Required**. The weather station's collector size. See {@link RainCollectorSize}.
     */
    readonly rainCollectorSize: RainCollectorSize;

    /**
     * **Optional**. Configures the units to use. Doesn't have to match the units displayed on your console. See {@link UnitSettings}.
     */
    readonly units?: Partial<UnitSettings>;
}
