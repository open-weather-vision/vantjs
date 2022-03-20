import VantPro2Interface from "./interfaces/VantPro2Interface";
import inspect from "./util/inspect";

// Create a new interface
const device = new VantPro2Interface("COM4");

// Wake up the console and interact with it when it's ready
device.ready(async () => {
    console.log("Connected to device!");

    // Validate the console's connection
    if (await device.validateConnection()) {
        console.log("Test worked!");
    } else {
        throw new Error("Connection to console failed");
    }

    // Getting the console's firmware version
    console.log("\n\nFirmware version: ");
    const firmwareVersion = await device.getFirmwareVersion();
    inspect(firmwareVersion);

    // Getting the latest highs and lows values
    console.log("\n\nHighs and lows: ");
    const highsAndLows = await device.getHighsAndLows();
    inspect(highsAndLows);

    // Getting the currently measured weather data (in short)
    console.log("\n\nRealtime Data: ");
    const realtimeDataShort = await device.getSimpleRealtimeRecord();
    inspect(realtimeDataShort);

    // Getting the currently measured weather data (in detail)
    console.log("\n\nRealtime Data: ");
    const realtimeData = await device.getRichRealtimeRecord();
    inspect(realtimeData);
});
