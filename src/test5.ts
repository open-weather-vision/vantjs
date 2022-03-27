import { VantInterface } from "./interfaces";
import { OnInterfaceCreate } from "./interfaces/settings";

(async () => {
    const port = await VantInterface.create({
        path: "COM4",
        rainCollectorSize: "0.2mm",
        onCreate: OnInterfaceCreate.DoNothing,
    });

    port.open();

    port.on("open", () => {
        console.log("open!");
    });
    port.on("open", () => {
        console.log("open!");
    });
    port.on("open", () => {
        console.log("open!");
    });
    port.on("open", () => {
        console.log("open!");
    });
    port.on("open", () => {
        console.log("open!");
    });
    port.on("open", () => {
        console.log("open!");
    });
})();
