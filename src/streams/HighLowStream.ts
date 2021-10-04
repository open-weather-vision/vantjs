import { VantInterface } from "..";
import { HighsAndLows } from "../structures/HighsAndLows";
import VantStream from "./RecordStream";

export default class HighLowStream extends VantStream<VantInterface, HighsAndLows>{
    constructor(wsInterface: VantInterface, interval: number) {
        super(wsInterface, interval, async (wsInterface) => {
            return wsInterface.getHighsAndLows();
        });
    }
}