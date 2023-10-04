import { BaudRate, RainCollectorSize } from "vant-environment/structures";
import { UnitSettings } from "vant-environment/units";
import { DeviceModel } from "./DeviceModel";
import { OnContainerCreate } from "./OnContainerCreate";

/**
 * The minimum required settings for any realtime data container.
 */
export interface MinimumRealtimeDataContainerSettings<
    SupportedDeviceModels extends DeviceModel
> {
    /**
     * **Required**. The used (serial) path to communicate with your weather station. On windows devices paths usually start with `COM` followed by the port number, on linux/osx
     * common paths start with `/dev/tty` followed by the port number.
     */
    readonly path: string;

    /**
     * **Required**. The model of the connected weather station. See {@link DeviceModel}.
     */
    readonly model: SupportedDeviceModels;

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
     * **Optional**. Configures the units to use. Doesn't have to match the units displayed on your console. See {@link UnitSettings}.
     */
    readonly units?: Partial<UnitSettings>;

    /**
     * **Optional**. The interval (_in seconds_) the container updates itself. Default is `60` seconds.
     *
     * On update the `"update"` and the `"valid-update"` (if the update succeeds) event fires.
     *
     * A smaller intervall leads to more up-to-date weather data but also more traffic.
     */
    readonly updateInterval?: number;

    /**
     * **Optional**. The action to perform automatically on creating the realtime data container. See {@link OnContainerCreate}.
     */
    readonly onCreate?: OnContainerCreate;
}
