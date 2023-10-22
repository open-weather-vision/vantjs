import WeatherStationAdvanced from "../weather-station/WeatherStationAdvanced";
import { waitForNewSerialConnection } from "../util";
import inspect from "./inspect";
import { sleep } from "vant-environment/utils";

async function main() {
    try {
        const device = await WeatherStationAdvanced.connect({
            path: "/dev/ttyUSB0",
            rainCollectorSize: "0.2mm",
            units: {
                soilMoisture: "cb",
                elevation: "m",
                evoTranspiration: "mm",
                humidity: "%",
                leafTemperature: "°C",
                soilTemperature: "°C",
                pressure: "hPa",
                temperature: "°C",
                rain: "mm",
                solarRadiation: "W/m²",
                wind: "km/h",
            },
            reconnectionInterval: 3
        });

        // Validate the console's connection
        if (await device.checkConnection()) {
            console.log("Test worked!");
        } else {
            throw new Error("Connection to console failed");
        }

        // Getting the console's firmware date code
        console.log("\n\nFirmware date code: ");
        const [firmwareDateCode, err1] = await device.getFirmwareDateCode();
        inspect(firmwareDateCode);

        // Getting highs and lows
        console.log("\n\nHighs and lows: ");
        const [highsAndLows, err2] = await device.getHighsAndLows();
        inspect(highsAndLows);

        // Getting default LOOP package
        console.log("\n\nDefault LOOP: ");
        const [defaultLOOP, err3] = await device.getDefaultLOOP();
        inspect(defaultLOOP);

        // Getting basic weather data
        console.log("\nBasic weather data: ");
        const [basicWeatherData, err4] = await device.getBasicRealtimeData();
        inspect(basicWeatherData);

        console.log("\nSupports LOOP2: ");
        const [support, errr] = await device.isSupportingLOOP2Packages();
        console.log(support);

        // Getting firmware version
        console.log("\nFirmware version: ");
        const [firmwareVersion, err5] = await device.getFirmwareVersion();
        inspect(firmwareVersion);

        // Getting LOOP1 package
        console.log("\nLOOP1 package: ");
        const [LOOP1, err6] = await device.getLOOP1();
        inspect(LOOP1);

        // Getting LOOP2 package
        console.log("\nLOOP2 package: ");
        const [LOOP2, err7] = await device.getLOOP2();
        inspect(LOOP2);

        // Getting a lot of weather data
        console.log("\nA lot of weather data: ");
        let [richRealtimeRecord, err8] = await device.getDetailedRealtimeData();
        inspect(richRealtimeRecord);

        console.log("\nWeather station type: ");
        const [type, err9] = await device.getWeatherstationType();
        inspect(type);

        /*
        await device.setBackgroundLight(false);
        setTimeout(async () => {
            await device.setBackgroundLight(true);
            await device.close();
        }, 4000);*/

        await sleep(100 * 1000);
        [richRealtimeRecord, err8] = await device.getDetailedRealtimeData();

        await device.disconnect();
    } catch (err) {
        console.error("Catched error: " + err);
    }
}

main();
