import VantError from "./VantError.js";

/**
 * Indicates that the data received from the console was malformed and could not be parsed. Should be a rare occurrence.
 */
export default class MalformedDataError extends VantError {
    /**
     * @hidden
     * @param msg
     */
    constructor(msg?: string) {
        super(
            msg === undefined ? "Received malformed data" : msg,
            "(malformed-data-error)"
        );
        Error.captureStackTrace(this, this.constructor);
    }
}
