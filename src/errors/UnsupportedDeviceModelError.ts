import VantError from "./VantError";

export default class UnsupportedDeviceModelError extends VantError {
    constructor(msg: string) {
        super(msg, "(unsupported-device-model)");
        Error.captureStackTrace(this, this.constructor);
    }
}
