import { VantInterface } from "../interfaces";

async function main() {
    const device = await VantInterface.create({
        path: "COM4",
        rainCollectorSize: "0.2mm",
    });

    // access data from your weather station
    const simpleRealtimeData = await device.getSimpleRealtimeData();

    
    console.log("Outside it's " + simpleRealtimeData.temperature.out + " °F");
    console.log("The wind speed is " + simpleRealtimeData.wind.current + " mph");
    console.log("The wind direction is " + simpleRealtimeData.wind.direction.abbrevation);
    console.log("The current rain rate is " + simpleRealtimeData.rain.rate + " in/h");
    console.log("The current pressure " + simpleRealtimeData.pressure.current + " inHg");
    console.log("(measured at " + simpleRealtimeData.time.toLocaleString() + ")");

    await device.close();
}

main();
