import BasicRealtimeDataContainer from "../realtime-containers/BasicRealtimeDataContainer.js";
import { WeatherStation } from "../weather-station/index.js";

async function main() {
    const station = await WeatherStation.connect({
        path: "COM7",
        rainCollectorSize: "0.2mm",
        units: {
            wind: "km/h",
        },
    });

    const realtime = station.createBasicRealtimeDataContainer({
        updateInterval: 1,
    });

    while (true) {
        await realtime.waitForUpdate();
        console.log(
            realtime.time.toLocaleString() +
                ": " +
                realtime.windAvg10m
        );
    }

    await realtime.pause();
}

main();
