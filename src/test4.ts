import "source-map-support/register";
import { DeviceModel } from "./realtime-containers/DeviceModel";
import { OnCreate } from "./realtime-containers/RealtimeDataContainer";
import SmallRealtimeDataContainer from "./realtime-containers/SmallRealtimeDataContainer";

async function main() {
    const weatherData = await SmallRealtimeDataContainer.create({
        device: {
            path: "COM4",
            model: DeviceModel.VantagePro2,
            rainCollectorSize: "0.2mm",
        },
        updateInterval: 3,
        onCreate: OnCreate.WaitForFirstValidUpdate,
        units: {
            wind: "km/h",
        },
    });

    while (true) {
        await weatherData.waitForUpdate();
        console.log(
            weatherData.time.toLocaleString() + ": " + weatherData.wind.avg
        );
    }

    await weatherData.close();
}

main();
