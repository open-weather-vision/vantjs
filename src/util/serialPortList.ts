import { SerialPort } from "serialport";

/**
 * Gets a list of information about the currently connected serial ports.
 *
 * @example
 * ```ts
 * getSerialPortList().then(console.log);
 * ```
 */
export default async () => {
    return await SerialPort.list();
};
