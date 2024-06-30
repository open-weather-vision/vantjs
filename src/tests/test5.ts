import { WeatherStationAdvanced } from "../weather-station";

async function main() {
    const device = await WeatherStationAdvanced.connect({
        path: "COM7",
        rainCollectorSize: "0.2mm",
    });

    // access data from your weather station
    const [simpleRealtimeData, err] = await device.getDetailedRealtimeData();

    console.log("Outside it's " + simpleRealtimeData.tempOut + " °F");
    console.log("The wind speed is " + simpleRealtimeData.wind + " mph");
    console.log("The wind direction is " + simpleRealtimeData.windDir);
    console.log(
        "The current rain rate is " + simpleRealtimeData.rainRate + " in/h"
    );
    console.log("The current pressure " + simpleRealtimeData.press + " inHg");
    console.log("Forecast: " + simpleRealtimeData.forecast);
    console.log(
        "(measured at " + simpleRealtimeData.time.toLocaleString() + ")"
    );

    await device.disconnect();
}

main();
