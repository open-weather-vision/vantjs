import "source-map-support/register";
import { DeviceModel } from "./realtime-containers/DeviceModel";
import BigRealtimeDataContainer from "./realtime-containers/BigRealtimeDataContainer";

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
