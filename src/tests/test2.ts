import "source-map-support/register";
import DetailedRealtimeDataContainer from "../realtime-containers/DetailedRealtimeDataContainer";
import { WeatherStationAdvanced } from "../weather-station";

async function main() {
    const station = await WeatherStationAdvanced.connect({
        path: "COM7",
        rainCollectorSize: "0.2mm",
        units: {
            temperature: "°C",
        },
        defaultTimeout: 250,
    });

    const realtime = station.createDetailedRealtimeDataContainer({
        updateInterval: 1,
    });

    realtime.on("start", () => {
        console.log("Container started!");
    });

    realtime.on("pause", () => {
        console.log("Container paused!");
    });

    let i = 0;
    while (i < 12) {
        await realtime.waitForUpdate();
        console.log(
            realtime.tempIn + station.settings.units.temperature
        );
        i++;
    }

    await realtime.pause();
}

main();
