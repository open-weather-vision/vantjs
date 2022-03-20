import VantError from "./VantError";

export default class ParserError extends VantError {
    constructor(msg: string) {
        super(msg, "(parser-error)");
        Error.captureStackTrace(this, this.constructor);
    }
}
