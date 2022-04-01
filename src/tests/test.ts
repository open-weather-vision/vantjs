import VantPro2Interface from "../interfaces/VantPro2Interface";
import inspect from "../util/inspect";

async function main() {
    try {
        const device = await VantPro2Interface.create({
            path: "COM4",
            rainCollectorSize: "0.2mm",
            units: {
                pressure: "hPa",
                temperature: "°C",
                rain: "mm",
                solarRadiation: "W/m²",
                wind: "km/h",
            },
        });

        // Validate the console's connection
        if (await device.validateConnection()) {
            console.log("Test worked!");
        } else {
            throw new Error("Connection to console failed");
        }

        // Getting the console's firmware date code
        console.log("\n\nFirmware date code: ");
        const firmwareDateCode = await device.getFirmwareDateCode();
        //inspect(firmwareDateCode);

        // Getting highs and lows
        console.log("\n\nHighs and lows: ");
        const highsAndLows = await device.getHighsAndLows();
        //inspect(highsAndLows);

        // Getting default LOOP package
        console.log("\n\nDefault LOOP: ");
        const defaultLOOP = await device.getDefaultLOOP();
        //inspect(defaultLOOP);

        // Getting basic weather data
        console.log("\nBasic weather data: ");
        const basicWeatherData = await device.getSimpleRealtimeData();
        //inspect(basicWeatherData);

        //console.log(await device.isSupportingLOOP2Packages());

        // Getting firmware version
        console.log("\nFirmware version: ");
        const firmwareVersion = await device.getFirmwareVersion();
        //inspect(firmwareVersion);

        // Getting LOOP1 package
        console.log("\nLOOP1 package: ");
        const LOOP1 = await device.getLOOP1();
        //inspect(LOOP1);

        // Getting LOOP2 package
        console.log("\nLOOP2 package: ");
        const LOOP2 = await device.getLOOP2();
        //inspect(LOOP2);

        // Getting a lot of weather data
        console.log("\nA lot of weather data: ");
        const richRealtimeRecord = await device.getRichRealtimeData();
        //inspect(richRealtimeRecord);

        await device.setBackgroundLight(false);

        setTimeout(async () => {
            await device.setBackgroundLight(true);
            await device.close();
        }, 4000);
    } catch (err) {
        console.error("Catched error: " + err);
    }
}

main();
