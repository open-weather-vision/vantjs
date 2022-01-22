import VantInterface from "../interfaces/VantInterface";
import { SimpleRealtimeRecord } from "../structures/SimpleRealtimeRecord";
import RecordStream from "./RecordStream";

export default class SimpleRecordStream extends RecordStream<
    VantInterface,
    SimpleRealtimeRecord
> {
    constructor(wsInterface: VantInterface, interval: number) {
        super(wsInterface, interval, async (wsInterface) => {
            return wsInterface.getSimpleRealtimeRecord();
        });
    }
}
