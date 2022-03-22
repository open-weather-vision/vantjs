import RichRealtimeDataContainer, {
    DeviceModel,
} from "./dataContainers/RichRealtimeDataContainer";
import "source-map-support/register";

async function main() {
    const weatherData: RichRealtimeDataContainer =
        new RichRealtimeDataContainer({
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
