import VantError from "./VantError";

export default class DeviceStillConnectedError extends VantError {
    constructor(msg: string) {
        super(msg, "(device-still-connected-error)");
        Error.captureStackTrace(this, this.constructor);
    }
}
