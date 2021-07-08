export default class DriverError extends Error {
    constructor(msg: string, errorType?: ErrorType) {
        if (errorType) msg = `${msg} ${errorType}`;
        super(msg);
        Error.captureStackTrace(this, this.constructor);
    }
}

export enum ErrorType {
    FAILED_TO_WRITE = "(failed-to-write)",
    INVALID_RESPONSE = "(invalid-response)",
    CONNECTION = "(connection-error)",
    CRC = "(crc-error)"
}