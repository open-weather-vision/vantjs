import VantError from "./VantError.js";

/**
 * Indicates that vantjs failed to wake up the console.
 */
export default class SerialConnectionError extends VantError {
    /**
     * @hidden
     */
    constructor() {
        super("Failed to wake up console!", "(failed-to-wake-up)");
        Error.captureStackTrace(this, this.constructor);
    }
}
