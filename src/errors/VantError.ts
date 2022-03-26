/**
 * Super class of all errors explicitly thrown by vantjs.
 */
export default class VantError extends Error {
    constructor(msg: string, errorType?: string) {
        if (errorType) msg = `${msg} ${errorType}`;
        super(msg);
        Error.captureStackTrace(this, this.constructor);
    }
}
