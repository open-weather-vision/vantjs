import "source-map-support/register";
import { DeviceModel } from "./dataContainers/DeviceModel";
import BigRealtimeDataContainer from "./dataContainers/BigRealtimeDataContainer";
import { OnCreate } from "./dataContainers/WeatherDataContainer";

async function main() {
    const weatherData = await BigRealtimeDataContainer.create({
        device: {
            path: "COM4",
            model: DeviceModel.VantagePro2,
        },
        updateInterval: 3,
        onCreate: OnCreate.WaitForFirstValidUpdate,
    });

    while (true) {
        await weatherData.waitForUpdate();
        console.log(weatherData.temperature.in + " °F");
    }

    await weatherData.close();
}

main();
