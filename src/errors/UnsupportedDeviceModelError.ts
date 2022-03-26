import VantError from "./VantError";

/**
 * Indicates that the connected weather station doesn't support the called function.
 */
export default class UnsupportedDeviceModelError extends VantError {
    constructor(msg: string) {
        super(msg, "(unsupported-device-model)");
        Error.captureStackTrace(this, this.constructor);
    }
}
