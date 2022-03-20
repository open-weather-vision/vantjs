import VantError from "./VantError";

export default class MalformedDataError extends VantError {
    constructor(msg?: string) {
        super(
            msg === undefined ? "Received malformed data" : msg,
            "(malformed-data-error)"
        );
        Error.captureStackTrace(this, this.constructor);
    }
}
