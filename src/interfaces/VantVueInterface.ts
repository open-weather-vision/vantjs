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
     * const device = await VantVueInterface.connect({ path: "COM3", rainCollectorSize: "0.2mm" });
     *
     *
     * const richRealtimeData = await device.getRichRealtimeData();
     * inspect(richRealtimeData);
     *
     * await device.disconnect();
     * ```
     * @param settings the settings
     *
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @throws {@link FailedToWakeUpError} if the console doesn't wake up after trying three times
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     */
    public static async create(settings: MinimumVantInterfaceSettings) {
        const device = new VantVueInterface(settings);

        await device.openSerialPort();
        await device.wakeUp(true);

        return device;
    }
}
