import "source-map-support/register";
import DetailedRealtimeInterface from "../realtime-interfaces/DetailedRealtimeInterface";

async function main() {
    const realtime = await DetailedRealtimeInterface.connect({
        path: "/dev/ttyUSB0",
        rainCollectorSize: "0.2mm",
        updateInterval: 1,
        units: {
            temperature: "°C",
        },
    });

    realtime.on("device-connect", () => {
        console.log("Connected device!");
    });

    realtime.on("device-disconnect", () => {
        console.log("Disconnected device!");
    });

    realtime.on("start", () => {
        console.log("Container started!");
    });

    realtime.on("destroy", () => {
        console.log("Container destroyed!");
    });

    let i = 0;
    while (i < 12) {
        await realtime.waitForUpdate();
        console.log(
            realtime.tempIn + realtime.settings.units.temperature
        );
        i++;
    }

    await realtime.destroy();
}

main();
