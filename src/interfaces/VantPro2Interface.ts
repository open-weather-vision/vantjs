import DriverError, { ErrorType } from "../DriverError";
import VantInterface from "./VantInterface"

export default class VantPro2Interface extends VantInterface {
    /**
     * Gets the console's firmware version. Only works on Vantage Pro 2 or Vantage Vue.
     * @returns the console's firmware version
     */
    public async getFirmwareVersion(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.port.write("NVER\n", (err) => {
                if (err) reject(new DriverError("Failed to get firmware version", ErrorType.FAILED_TO_WRITE));
                this.port.once("data", (data: Buffer) => {
                    const response = data.toString("utf-8");
                    try {
                        const firmwareVersion = response.split("OK")[1].trim();
                        resolve(`v${firmwareVersion}`);
                    } catch (err) {
                        reject(new DriverError("Failed to get firmware version", ErrorType.INVALID_RESPONSE));
                    }
                });
            });
        })
    }
}