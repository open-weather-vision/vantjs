# vantjs
vantjs is a javascript/typescript interface to the Davis Vantage Pro, Pro 2 and Vue. <br>
❌ Development still in progress. Many features are not finished and not stable<br>
⏩ Version 0.1.0 is released very soon offering basic functionality to interact with your Vantage Pro, Pro 2 and Vue.

# Installation (not working yet)

```
npm install vantjs
```

# Usage

```typescript
import VantageInterface from "vantjs";

// The interface automatically connects to the console in the background and tries to wake it up.
const device = new VantageInterface("COM3");

// Once the console has been woken up, you can interact with it.
device.once("awakening", async () => {
    console.log("Connected to device!");

    // You always should validate the connection
    if (await device.validateConnection()) {
        console.log("Test worked!")
    } else {
        throw new Error("Connection to console failed.");
    }

    // Getting the console's firmware version
    const firmwareVersion = await device.getFirmwareVersion();
    console.log(firmwareVersion);

    // Getting the current high and low values
    const highsAndLows = await device.getHighsAndLows();
    console.log(highsAndLows);

    // Getting the currently measured weather data
    const realtimeData = await device.getRealtimeData();
    console.log(realtimeData);

    // You always should close the connection to the console once you are done
    device.close();
})
```
