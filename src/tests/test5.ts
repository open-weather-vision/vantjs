import { WeatherStationAdvanced } from "../weather-station/index.js";

async function main() {
    const device = await WeatherStationAdvanced.connect({
        path: "COM7",
        rainCollectorSize: "0.2mm",
    });

    // access data from your weather station
    const [BasicRealtimeData, err] = await device.getDetailedRealtimeData();

    console.log("Outside it's " + BasicRealtimeData.tempOut + " °F");
    console.log("The wind speed is " + BasicRealtimeData.wind + " mph");
    console.log("The wind direction is " + BasicRealtimeData.windDir);
    console.log(
        "The current rain rate is " + BasicRealtimeData.rainRate + " in/h"
    );
    console.log("The current pressure " + BasicRealtimeData.press + " inHg");
    console.log("Forecast: " + BasicRealtimeData.forecast);
    console.log(
        "(measured at " + BasicRealtimeData.time.toLocaleString() + ")"
    );
    // await device.setBackgroundLight(true);

    await device.disconnect();
}

main();
