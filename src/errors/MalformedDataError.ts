import VantError from "./VantError";

export default class MalformedDataError extends VantError {
    constructor(msg: string) {
        super(msg, "(malformed-data-error)");
        Error.captureStackTrace(this, this.constructor);
    }
}