# vantjs (v1.0.0 branch)

![npm](https://img.shields.io/npm/v/vantjs) ![GitHub milestones](https://img.shields.io/github/milestones/all/harrydehix/vantjs) ![GitHub last commit](https://img.shields.io/github/last-commit/harrydehix/vantjs)<br>
vantjs is a platform-independent javascript and typescript interface to the Davis Vantage Pro, Pro 2 and Vue. It works on any linux, windows or osx device!

#### Development news

⚠ _Development on v1.0.0 is still in progress. Some features are not stable, some are not finished._ <br><br>

## **What's new in v1.0.0?**

-   _unit settings_: select the units vantjs should use, the weather data is converted automatically
-   _bug fixes / stability_: version 1.0.0 will be the first stable, extensively tested release of vantjs. many bug fixes have already been made in this branch.
-   _guides/documentation_: helpful guides introducing you into vantjs step by step and a full documentation

# Installation

```
npm install vantjs
```

# Usage

### Interfaces

The `VantInterface` class provides the basic features that all Vantage stations offer.

```typescript
import { VantInterface } from "vantjs/interfaces";
import { inspect } from "vantjs/utils";

async function main() {
    const device = await VantInterface.create({ path: "COM4" });

    // Getting highs and lows
    const highsAndLows = await device.getHighsAndLows();
    inspect(highsAndLows);

    // Getting realtime weather data
    const realtimeWeatherData = await device.getSimpleRealtimeRecord();
    inspect(realtimeWeatherData);

    // Closing the connection to the device
    await device.close();
}

main();
```

The `VantVueInterface`, `VantProInterface` and the `VantPro2Interface` offer station-dependent additional features.

### Realtime Data Containers

Realtime data containers are another level of abstraction hiding all the complex details from you. They are still in development, more news are coming soon.

```ts
import {
    BigRealtimeDataContainer,
    DeviceModel,
} from "vantjs/realtime-containers";

async function main() {
    const weather = await BigRealtimeDataContainer.create({
        device: {
            path: "COM4",
            model: DeviceModel.VantagePro2,
        },
        // the interval (in seconds) the realtime data container is updated
        updateInterval: 10,
    });

    for (let i = 0; i < 100; i++) {
        const err = await weather.waitForUpdate();
        if (err) {
            console.error("Device not connected!");
        } else {
            console.log(
                `${weather.time.toLocaleString()}: ${
                    weather.temperature.out
                } °F`
            );
        }
    }

    // closing the connection
    await weather.close();
}

main();
```

# Documentation

_Coming soon!_
