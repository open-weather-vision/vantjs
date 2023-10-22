import "source-map-support/register";
import BasicRealtimeInterface from "../realtime-interfaces/BasicRealtimeInterface";

async function main() {
    const weatherData = await BasicRealtimeInterface.connect({
        path: "/dev/ttyUSB0",
        rainCollectorSize: "0.2mm",
        updateInterval: 1,
        units: {
            wind: "km/h",
        },
    });

    while (true) {
        try {
            await weatherData.waitForUpdate();
        } catch (err) {
        } finally {
            console.log(
                weatherData.time.toLocaleString() +
                    ": " +
                    weatherData.windAvg10m
            );
        }
    }

    await weatherData.destroy();
}

main();
