import VantError from "./VantError.js";

/**
 * Indicates that the data received from the console was different then expected and therefore couldn't be parsed.
 * This shouldn't happen. Please contact the package developer if this error occurrs.
 */
export default class ParserError extends VantError {
    /**
     * @hidden
     * @param msg
     */
    constructor(msg: string) {
        super(msg, "(parser-error)");
        Error.captureStackTrace(this, this.constructor);
    }
}
