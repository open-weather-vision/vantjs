import VantError from "./VantError";

/**
 * Is thrown when one tries to get (weather) data from a closed interface.
 */
export default class ClosedConnectionError extends VantError {
    constructor(msg?: string) {
        super(
            msg === undefined
                ? "Serial connection to weather station is closed"
                : msg,
            "(closed-connection-error)"
        );
        Error.captureStackTrace(this, this.constructor);
    }
}
