# vantjs

![npm](https://img.shields.io/npm/v/vantjs) ![GitHub milestones](https://img.shields.io/github/milestones/all/harrydehix/vantjs) ![GitHub last commit](https://img.shields.io/github/last-commit/harrydehix/vantjs)<br>
vantjs is a platform-independent javascript and typescript interface to the Davis Vantage Pro, Pro 2 and Vue. It works on any linux, windows or osx device!

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
    const device = await VantInterface.create({
        path: "COM4",
        rainCollectorSize: "0.2mm",
    });

    // Getting highs and lows
    const highsAndLows = await device.getHighsAndLows();
    inspect(highsAndLows);

    // Getting realtime weather data
    const realtimeWeatherData = await device.getSimpleRealtimeData();
    inspect(realtimeWeatherData);

    // Closing the connection to the device
    await device.close();
}

main();
```

The `VantVueInterface`, `VantProInterface` and the `VantPro2Interface` offer station-dependent additional features.

### Realtime Data Containers

Realtime data containers are another level of abstraction hiding all the complex details from you.

```ts
import { BigRealtimeDataContainer } from "vantjs/realtime-containers";
import { DeviceModel } from "vantjs/realtime-containers/settings";

async function main() {
    const container = await BigRealtimeDataContainer.create({
        path: "COM4",
        model: DeviceModel.VantagePro2,
        rainCollectorSize: "0.2mm",
        // the interval (in seconds) the realtime data container is updated
        updateInterval: 10,
    });

    setInterval(() => {
        const time = container.time.toLocaleString();
        const temperature = container.temperature.out;

        console.log(`${time}: ${temperature} °F`);
    }, 60 * 1000);
}

main();
```

# Getting Started

Read an introductory guide [here](
    /guides/1-getting-started.md).

# Documentation

Read the full documentation [here](https://harrydehix.github.io/vantjs/).
