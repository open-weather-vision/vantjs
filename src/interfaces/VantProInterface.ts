/**
 * Interface to the _Vantage Pro_ weather station. Is built on top of the {@link VantInterface}.
 *
 * Is currently offering nothing special.
 *
 */

import { MinimumVantInterfaceSettings } from "./settings/MinimumVantInterfaceSettings";
import VantInterface from "./VantInterface";

export default class VantProInterface extends VantInterface {
    /**
     * Creates an interface to your vantage pro weather station using the passed settings. The device should be connected
     * serially.
     *
     * @example
     * ```typescript
     * const device = await VantProInterface.create({ path: "COM3", rainCollectorSize: "0.2mm" });
     *
     *
     * const highsAndLows = await device.getHighsAndLows();
     * inspect(highsAndLows);
     *
     * await device.close();
     * ```
     * @param settings the settings
     */
    public static async create(settings: MinimumVantInterfaceSettings) {
        const device = new VantInterface(settings);

        await this.performOnCreateAction(device);

        return device;
    }
}
