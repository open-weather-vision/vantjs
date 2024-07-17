import VantError from "./VantError";

/**
 * Indicates that the connected weather station didn't respond or responded too slowly.
 */
export default class TimeoutError extends VantError {
    /**
     * @hidden
     * @param msg
     */
    constructor(timeout: number) {
        super(
            `Timeout of ${timeout}ms exceeded. Weather station didn't respond!`,
            "(timeout-error)"
        );
        Error.captureStackTrace(this, this.constructor);
    }
}
