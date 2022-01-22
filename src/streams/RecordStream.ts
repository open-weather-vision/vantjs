import { Readable } from "stream";
import { VantInterface } from "..";

export default class RecordStream<I extends VantInterface, O> extends Readable {
    /**
     * weather station interface to use
     */
    private readonly wsInterface: I;
    /**
     * record interval in seconds
     */
    private readonly interval: number;
    /**
     *
     */
    private readonly reader: (wsInterface: I) => Promise<O>;

    private interval_object: NodeJS.Timeout | null = null;

    constructor(
        wsInterface: I,
        interval: number,
        reader: (wsInterface: I) => Promise<O>
    ) {
        super({ objectMode: true });
        this.wsInterface = wsInterface;
        this.interval = interval;
        this.reader = reader;
    }

    start() {
        if (this.interval_object) {
            clearInterval(this.interval_object);
        }

        this.interval_object = setInterval(async () => {
            this.push(await this.reader(this.wsInterface));
        }, this.interval * 1000);
    }

    stop() {
        if (this.interval_object) {
            clearInterval(this.interval_object);
        }
        this.push(null);
    }
}
