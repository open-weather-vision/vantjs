import VantError from "./VantError";

export default class MissingDevicePathError extends VantError {
    constructor() {
        super(
            "You didn't configure the weather station's serial path",
            "(missing-device-path)"
        );
        Error.captureStackTrace(this, this.constructor);
    }
}
