import "source-map-support/register";
import { DeviceModel } from "./dataContainers/DeviceModel";
import BigRealtimeDataContainer from "./dataContainers/BigRealtimeDataContainer";

async function main() {
    const weatherData = await BigRealtimeDataContainer.create({
        device: {
            path: "COM4",
            model: DeviceModel.VantagePro2,
            rainCollectorSize: "0.2mm",
        },
        updateInterval: 3,
        units: {
            temperature: "°C",
        },
    });

    while (true) {
        await weatherData.waitForUpdate();
        console.log(
            weatherData.temperature.in + weatherData.settings.units.temperature
        );
    }

    await weatherData.close();
}

main();
