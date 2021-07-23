# vantjs
vantjs is a crossplatform javascript/typescript interface to the Davis Vantage Pro, Pro 2 and Vue. Works on any Linux, Windows or OSX device! <br>
❌ Development still in progress. Many features are not finished and not stable.<br>
⏩ Version 0.1.0 has just been released offering basic functionality to interact with your Vantage Pro, Pro 2 and Vue.

# Installation
```
npm install vantjs
```

# Usage

#### Typescript

The VantInterface class provides the basic features that all Vantage stations offer.
```typescript
import { VantInterface } from "vantjs";

// The interface automatically connects to the console in the background and tries to wake it up.
const device = new VantInterface("COM3");

// Once the console has been woken up, you can interact with it.
device.once("awakening", async () => {
    console.log("Connected to device!");

    // You always should validate the connection
    if (await device.validateConnection()) {
        console.log("Test worked!")
    } else {
        throw new Error("Connection to console failed.");
    }

    // Getting the console's firmware date code
    const firmwareVersion = await device.getFirmwareDateCode();
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
The `VantVueInterface`, `VantProInterface` and the `VantPro2Interface` offer station-dependent additional features.

### Javascript
The VantInterface class provides the basic features that all Vantage stations offer.
```javascript
const { VantInterface } = require("vantjs");

// The interface automatically connects to the console in the background and tries to wake it up.
const device = new VantInterface("COM3");

// Once the console has been woken up, you can interact with it.
device.once("awakening", async () => {
    console.log("Connected to device!");

    // You always should validate the connection
    if (await device.validateConnection()) {
        console.log("Test worked!")
    } else {
        throw new Error("Connection to console failed.");
    }

    // Getting the console's firmware date code
    const firmwareVersion = await device.getFirmwareDateCode();
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
The `VantVueInterface`, `VantProInterface` and the `VantPro2Interface` offer station-dependent additional features.

# Documentation
_Coming soon!_

# Contributing

_Coming soon!_
