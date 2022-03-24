import { MinimumVantInterfaceSettings } from "./VantInterface";
import VantPro2Interface from "./VantPro2Interface";

/**
 * Interface to the _Vantage Vue_ weather station. Is built on top of the {@link VantPro2Interface}.
 *
 * Offers station dependent features like {@link getRichRealtimeRecord}, {@link getLOOP}, {@link getLOOP2} and {@link getFirmwareVersion}.
 */
export default class VantVueInterface extends VantPro2Interface {
    /**
     * Creates an interface to your vantage vue weather station using the passed settings. The device should be connected
     * serially. The passed path specifies the path to communicate with the weather station. On Windows paths
     * like `COM1`, `COM2`, ... are common, on osx/linux devices common paths are `/dev/tty0`, `/dev/tty2`, ...
     *
     * @example
     * const device = await VantVueInterface.create({ path: "COM3" });
     *
     * await device.open();
     * await device.wakeUp();
     *
     * const highsAndLows = await device.getHighsAndLows();
     * inspect(highsAndLows);
     * @param settings the settings
     */
    public static async create(settings: MinimumVantInterfaceSettings) {
        const device = new VantVueInterface(settings);

        await this.performOnCreateAction(device);

        return device;
    }
}
