import "source-map-support/register";
import { DeviceModel } from "./realtime-data-containers/settings";
import { OnContainerCreate } from "./realtime-data-containers/settings/OnContainerCreate";
import SmallRealtimeDataContainer from "./realtime-data-containers/SmallRealtimeDataContainer";

async function main() {
    const weatherData = await SmallRealtimeDataContainer.create({
        path: "COM4",
        model: DeviceModel.VantagePro2,
        rainCollectorSize: "0.2mm",
        updateInterval: 3,
        onCreate: OnContainerCreate.Start,
        units: {
            wind: "km/h",
        },
    });

    while (true) {
        await weatherData.waitForUpdate();
        console.log(
            weatherData.time.toLocaleString() + ": " + weatherData.wind.avg10min
        );
    }

    await weatherData.stop();
}

main();
