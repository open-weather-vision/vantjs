import "source-map-support/register";
import BasicRealtimeInterface from "../realtime-interfaces/BasicRealtimeInterface";

async function main() {
    const weatherData = await BasicRealtimeInterface.connect({
        path: "COM7",
        rainCollectorSize: "0.2mm",
        updateInterval: 1,
        units: {
            wind: "km/h",
        },
    });

    while (true) {
        await weatherData.waitForUpdate();
        console.log(
            weatherData.time.toLocaleString() +
                ": " +
                weatherData.windAvg10m
        );
    }

    await weatherData.destroy();
}

main();
