import { VantInterface } from "..";
import { HighsAndLows } from "../structures/HighsAndLows";
import RecordStream from "./RecordStream";

export default class HighLowStream extends RecordStream<
    VantInterface,
    HighsAndLows
> {
    constructor(wsInterface: VantInterface, interval: number) {
        super(wsInterface, interval, async (wsInterface) => {
            return wsInterface.getHighsAndLows();
        });
    }
}
