import VantError from "./VantError";

export default class FailedToSendCommandError extends VantError {
    constructor(msg?: string) {
        super(
            msg === undefined
                ? "Failed to send command to weather station"
                : msg,
            "(failed-to-send-command-error)"
        );
        Error.captureStackTrace(this, this.constructor);
    }
}
