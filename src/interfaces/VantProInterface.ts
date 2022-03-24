import VantInterface, {
    MinimumVantInterfaceSettings,
    OnCreate,
} from "./VantInterface";

/**
 * Interface to the _Vantage Pro_ weather station. Is built on top of the {@link VantInterface}.
 *
 * Is currently offering nothing special.
 */

export default class VantProInterface extends VantInterface {
    /**
     * Creates an interface to your vantage pro weather station using the passed settings. The device should be connected
     * serially. The passed path specifies the path to communicate with the weather station. On Windows paths
     * like `COM1`, `COM2`, ... are common, on osx/linux devices common paths are `/dev/tty0`, `/dev/tty2`, ...
     *
     * @example
     * const device = await VantProInterface.create({ path: "COM3" });
     *
     * await device.open();
     * await device.wakeUp();
     *
     * const highsAndLows = await device.getHighsAndLows();
     * inspect(highsAndLows);
     * @param settings the settings
     */
    public static async create(settings: MinimumVantInterfaceSettings) {
        const device = new VantInterface(settings);

        await this.performOnCreateAction(device);

        return device;
    }
}
