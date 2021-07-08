import inspect from "./util/inspect";
import VantageInterface from "./VantageInterface";

// The interface automatically connects to the console in the background and tries to wake it up.
const device = new VantageInterface("COM3");

// Once the console has been woken up, you can interact with it.
device.once("awakening", async () => {
    console.log("Connected to device!");

    // You always should validate the connection
    if (await device.validateConnection()) {
        console.log("Test worked!")
    } else {
        throw new Error("Connection to console failed.");
    }

    // Getting the console's firmware version
    const firmwareVersion = await device.getFirmwareVersion();
    console.log(firmwareVersion);

    // Getting the current highs and lows values
    const highsAndLows = await device.getHighsAndLows();
    console.log(highsAndLows);

    // Getting the currently measured weather data
    const realtimeData = await device.getRealtimeData();
    console.log(realtimeData);

    // Closing the connection to the console
    device.close();
})