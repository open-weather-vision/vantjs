# vantjs

![](https://badgen.net/npm/v/vantjs)
![](https://badgen.net/npm/dy/vantjs)
![](https://badgen.net/npm/types/vantjs)
![](https://badgen.net/npm/license/vantjs)
![](https://badgen.net/badge/documentation/available/green?icon=wiki)
<br>
vantjs is a platform-independent javascript and typescript interface to the Davis Vantage Pro, Pro 2 and Vue. It works on any linux, windows or osx device!

# Installation

```
npm install vantjs
```

# Usage

### Interfaces

The `VantInterface` is the most straightforward way to connect with your
weather station and retrieve realtime weather data.

```typescript
import { VantInterface } from "vantjs/interfaces";
// or
const { VantInterface } = require("vantjs/interfaces");

async function main() {
    // Connecting to the weather station
    const device = await VantInterface.create({
        path: "COM4",
        rainCollectorSize: "0.2mm",
    });

    // Getting highs and lows
    const highsAndLows = await device.getHighsAndLows();
    console.log(
        `The maximum rain rate measured today was ${highsAndLows.rainRate.day} in/h`
    );

    // Getting realtime weather data
    const realtimeWeatherData = await device.getSimpleRealtimeData();
    console.log(`It's ${realtimeWeatherData.tempOut} °F outside!`);

    // Closing the connection to the device
    await device.close();
}

main();
```

The `VantVueInterface`, `VantProInterface` and the `VantPro2Interface` offer station-dependent additional features.

### Realtime Data Containers

Realtime data containers are another level of abstraction hiding all the complex details from you. They are self updating.

```ts
import { BigRealtimeDataContainer } from "vantjs/realtime-containers";
import { DeviceModel } from "vantjs/realtime-containers/settings";
// or
const { BigRealtimeDataContainer } = require("vantjs/realtime-containers");
const { DeviceModel } = require("vantjs/realtime-containers/settings");

async function main() {
    // Connecting to the weather station
    const container = await BigRealtimeDataContainer.create({
        path: "COM4",
        model: DeviceModel.VantagePro2,
        rainCollectorSize: "0.2mm",
        // the interval (in seconds) the realtime data container is updated
        updateInterval: 10,
    });

    setTimeout(async () => {
        // This data is still up-to-date, because the container updates itself automatically
        console.log(`It's ${container.tempOut} °F outside!`);
        await container.stop();
    }, 1000 * 60);
}

main();
```

# Getting Started

Read an introductory guide [here](/guides/1-getting-started.md).

# Documentation

Read the full documentation [here](https://harrydehix.github.io/vantjs/).
