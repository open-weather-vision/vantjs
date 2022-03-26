import VantError from "./VantError";

/**
 * Indicates that vantjs failed to wake up the console.
 */
export default class SerialConnectionError extends VantError {
    constructor() {
        super("Failed to wake up console!", "(failed-to-wake-up)");
        Error.captureStackTrace(this, this.constructor);
    }
}
