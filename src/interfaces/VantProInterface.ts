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
     * const device = await VantProInterface.connect({ path: "COM3", rainCollectorSize: "0.2mm" });
     *
     *
     * const highsAndLows = await device.getHighsAndLows();
     * inspect(highsAndLows);
     *
     * await device.disconnect();
     * ```
     * @param settings the settings
     *
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @throws {@link FailedToWakeUpError} if the console doesn't wake up after trying three times
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     */
    public static async connect(settings: MinimumVantInterfaceSettings) {
        const device = new VantProInterface(settings);

        await device.openSerialPort();
        await device.wakeUp(true);

        return device;
    }
}
