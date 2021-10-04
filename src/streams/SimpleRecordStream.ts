import VantInterface from "../interfaces/VantInterface";
import { SimpleRealtimeRecord } from "../structures/SimpleRealtimeRecord";
import VantStream from "./RecordStream";

export default class SimpleRecordStream extends VantStream<VantInterface, SimpleRealtimeRecord>{
    constructor(wsInterface: VantInterface, interval: number) {
        super(wsInterface, interval, async (wsInterface) => {
            return wsInterface.getSimpleRealtimeRecord();
        });
    }
}