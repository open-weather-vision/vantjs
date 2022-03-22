import BigRealtimeDataContainer from "./dataContainers/BigRealtimeDataContainer";
import { DeviceModel } from "./dataContainers/DeviceModel";
import "source-map-support/register";

async function main() {
    const weatherData: BigRealtimeDataContainer = new BigRealtimeDataContainer({
        device: {
            path: "COM4",
            model: DeviceModel.VantagePro2,
            baudRate: 19200,
        },
        updateInterval: 4,
    });

    await weatherData.firstUpdate();

    console.log(weatherData.temperature.in + " °F");

    await weatherData.close();
}

main();
