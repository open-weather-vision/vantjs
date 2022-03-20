import VantError from "./VantError";

export default class SerialConnectionError extends VantError {
    constructor(msg: string) {
        super(msg, "(serial-connection-error)");
        Error.captureStackTrace(this, this.constructor);
    }
}
