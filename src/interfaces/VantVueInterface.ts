import { MinimumVantInterfaceSettings } from "./settings/MinimumVantInterfaceSettings";
import VantPro2Interface from "./VantPro2Interface";

/**
 * Interface to the _Vantage Vue_ weather station. Is built on top of the {@link VantPro2Interface}.
 *
 * Offers station dependent features like {@link VantVueInterface.getRichRealtimeData}, {@link VantVueInterface.getLOOP1}, {@link VantVueInterface.getLOOP2}, {@link VantVueInterface.isSupportingLOOP2Packages}  and {@link VantVueInterface.getFirmwareVersion}.
 */
export default class VantVueInterface extends VantPro2Interface {
    /**
     * Creates an interface to your vantage vue weather station using the passed settings. The device should be connected
     * serially.
     *
     * @example
     * ```typescript
     * const device = await VantVueInterface.create({ path: "COM3", rainCollectorSize: "0.2mm" });
     *
     *
     * const richRealtimeData = await device.getRichRealtimeData();
     * inspect(richRealtimeData);
     *
     * await device.close();
     * ```
     * @param settings the settings
     */
    public static async create(settings: MinimumVantInterfaceSettings) {
        const device = new VantVueInterface(settings);

        await this.performOnCreateAction(device);

        return device;
    }
}
