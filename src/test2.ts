import RichRealtimeDataContainer, {
    DeviceModel,
} from "./weatherContainer/RichRealtimeDataContainer";

const weatherData: RichRealtimeDataContainer = new RichRealtimeDataContainer({
    device: {
        path: "COM3",
        model: DeviceModel.VantagePro2,
        baudRate: 19200,
    },
    updateInterval: 1,
});

weatherData.on("error", (err: Error) => {
    console.error(err);
});

weatherData.connect();

setInterval(() => {
    console.log(weatherData.temperature.in);
}, 5000);
