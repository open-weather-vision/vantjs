# vantjs

![npm](https://img.shields.io/npm/v/vantjs) ![GitHub milestones](https://img.shields.io/github/milestones/all/harrydehix/vantjs) ![GitHub last commit](https://img.shields.io/github/last-commit/harrydehix/vantjs)<br>
vantjs is a platform-independent javascript and typescript interface to the Davis Vantage Pro, Pro 2 and Vue. It works on any linux, windows or osx device!

#### Development news

❌ _Development still in progress. Some features are not finished and not stable._ <br>
⏩ _Version 0.1.0 has just been released offering basic functionality to interact with your Vantage Pro, Pro 2 and Vue._

# Installation

```
npm install vantjs
```

# Usage

The `VantInterface` class provides the basic features that all Vantage stations offer.

```typescript
import { VantInterface, inspect } from "vantjs";

// Create a new interface
const device = new VantInterface("COM3");

// Wake up the console and interact with it when it's ready
device.ready(async () => {
    console.log("Connected to device!");

    // Validate the console's connection
    if (await device.validateConnection()) {
        console.log("Test worked!");
    } else {
        throw new Error("Connection to console failed.");
    }

    // Get the console's firmware date code
    console.log("\n\nFirmware version: ");
    const firmwareDateCode = await device.getFirmwareDateCode();
    inspect(firmwareDateCode);

    // Get the latest highs and lows values
    console.log("\n\nHighs and lows: ");
    const highsAndLows = await device.getHighsAndLows();
    inspect(highsAndLows);

    // Get the currently measured weather data (in short)
    console.log("\n\nRealtime Data: ");
    const realtimeDataShort = await device.getSimpleRealtimeRecord();
    inspect(realtimeDataShort);

    // Connection to console gets closed automatically
});
```

The `VantVueInterface`, `VantProInterface` and the `VantPro2Interface` offer station-dependent additional features.

# Documentation

_Coming soon!_
