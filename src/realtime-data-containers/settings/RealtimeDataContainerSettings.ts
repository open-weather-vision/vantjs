import { BaudRate, RainCollectorSize } from "vant-environment";
import { UnitSettings } from "vant-environment/units";
import { DeviceModel } from "./DeviceModel";
import { OnContainerCreate } from "./OnContainerCreate";

/**
 * Settings for the {@link SmallRealtimeDataContainer} and the {@link BigRealtimeDataContainer}.
 * {@link MinimumRealtimeDataContainerSettings} describes the mimimum required settings to be configured when creating
 * a realtime data container.
 */
export interface RealtimeDataContainerSettings<
    SupportedDeviceModels extends DeviceModel
> {
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
     * The model of the connected weather station. See {@link DeviceModel}.
     */
    readonly model: SupportedDeviceModels;

    /**
     * The interval (_in seconds_) the container updates itself. Default is `60` seconds.
     *
     * On update the `"update"` and the `"valid-update"` (if the update succeeds) event fires.
     *
     * A smaller intervall leads to more up-to-date weather data but also more traffic.
     */
    readonly updateInterval: number;

    /**
     * The action to perform automatically on creating the realtime data container. See {@link OnContainerCreate}.
     */
    readonly onCreate: OnContainerCreate;
}
