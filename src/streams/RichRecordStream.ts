import { VantPro2Interface, VantVueInterface } from "..";
import { RichRealtimeRecord } from "../structures/RichRealtimeRecord";
import VantStream from "./RecordStream";

export default class RichRecordStream extends VantStream<VantPro2Interface | VantVueInterface, RichRealtimeRecord>{
    constructor(wsInterface: VantPro2Interface | VantVueInterface, interval: number) {
        super(wsInterface, interval, async (wsInterface) => {
            return await wsInterface.getRichRealtimeRecord();
        });
    }
}