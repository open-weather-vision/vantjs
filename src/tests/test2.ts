import "source-map-support/register";
import BigRealtimeDataContainer from "../realtime-data-containers/BigRealtimeDataContainer";
import {
    DeviceModel,
    OnContainerCreate,
} from "../realtime-data-containers/settings";

async function main() {
    const weatherData = await BigRealtimeDataContainer.create({
        path: "COM4",
        model: DeviceModel.VantagePro2,
        rainCollectorSize: "0.2mm",
        updateInterval: 3,
        units: {
            temperature: "°C",
        },
        onCreate: OnContainerCreate.DoNothing,
    });

    weatherData.on("device-open", () => {
        console.log("Connected device!");
    });

    weatherData.on("device-close", () => {
        console.log("Disconnected device!");
    });

    weatherData.on("start", () => {
        console.log("Container started!");
    });

    weatherData.on("stop", () => {
        console.log("Container stopped!");
    });

    weatherData.start();

    let i = 0;
    while (i < 12) {
        await weatherData.waitForUpdate();
        console.log(
            weatherData.temperature.in + weatherData.settings.units.temperature
        );
        i++;
    }

    await weatherData.stop();
}

main();
