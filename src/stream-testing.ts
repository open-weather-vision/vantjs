import { VantPro2Interface } from ".";
import RichRecordStream from "./streams/RichRecordStream";
import SimpleRecordStream from "./streams/SimpleRecordStream";

const wsInterface = new VantPro2Interface("COM3");

wsInterface.ready(async () => {
    const stream = new RichRecordStream(wsInterface, 23);

    stream.on("data", (data) => {
        console.log("#################################################################################################");
        console.log(data);
        console.log("#################################################################################################");
    });
});
