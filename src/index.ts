import inspect from "./util/inspect";
import VantageInterface from "./VantageInterface";


const device = new VantageInterface("COM3");

device.once("awakening", async () => {
    console.log("Connected to device!");

    if (await device.validateConnection()) {
        console.log("Test worked!")
    } else {
        console.log("Test failed!")
    }


    // const result = await device.getFirmwareVersion();
    // console.log(result);

    // const highsAndLows = await device.getHighsAndLows();
    // inspect(highsAndLows);

    const realtimeData = await device.getRealtimeData();
    inspect(realtimeData);

    device.close();
})