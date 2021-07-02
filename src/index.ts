import VantageInterface from "./VantageInterface";



async function doStuff() {
    const device = new VantageInterface("COM3");

    await device.wakeUp();
    console.log("Connected!");

    if (await device.isAvailable()) {
        console.log("Test worked!")
    } else {
        console.log("Test failed!")
    }

    const result = await device.getFirmwareVersion();
    console.log(result);

    await device.getHighsAndLows();
}

doStuff();