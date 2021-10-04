import { Readable } from "stream";
import { VantInterface } from "..";

export default class VantStream<I extends VantInterface, O> extends Readable {
    /**
     * weather station interface to use
     */
    wsInterface: I;
    /**
     * record interval in seconds
     */
    interval: number;

    private _firstEntry = true;

    private readonly reader: (wsInterface: I) => Promise<O>;

    constructor(wsInterface: I, interval: number, reader: (wsInterface: I) => Promise<O>) {
        super({ objectMode: true });
        this.wsInterface = wsInterface;
        this.interval = interval;
        this.reader = reader;
    }

    async _read() {
        if (this._firstEntry) {
            this.push(await this.reader(this.wsInterface));
            this._firstEntry = false;
        }
        else {
            setTimeout(async () => {
                this.push(await this.reader(this.wsInterface));
            }, this.interval * 1000);
        }
    }

    async stop() {
        this.push(null);
    }

}