# vantjs

![](https://badgen.net/npm/v/vantjs)
![](https://badgen.net/npm/dy/vantjs)
![](https://badgen.net/npm/types/vantjs)
![](https://badgen.net/npm/license/vantjs)
![](https://badgen.net/badge/documentation/available/green?icon=wiki)
<br>
vantjs is a platform-independent javascript and typescript interface to the Davis Vantage Pro, Pro 2 and Vue. It works on any linux, windows or osx device!

# Features

- Getting **hourly, daily, monthly** and **yearly highs and lows** (read more [here](https://harrydehix.github.io/vantjs/classes/structures.HighsAndLows.html))
```ts
const highsAndLows = await device.getHighsAndLows();

console.log(`Todays minimum temperature was ${highsAndLows.tempOut.day.low} °F!`);
// Output: Today's minimum temperature was 25.3 °F!

console.log(`The maximum rain rate in the current hour was ${highsAndLows.rainRate.hour} in/h!`);
// Output: The maximum rain rate in the current hour was 0.2 in/h!
```
- Getting **realtime weather data** (read more [here](https://harrydehix.github.io/vantjs/classes/structures.RichRealtimeData.html#windAvg10m))
```ts
const realtime = await device.getRichRealtimeData();

console.log(`Currently it's ${realtime.tempOut} °F!`);
// Output: Currently it's 45.2 °F!

console.log(`The wind blows from ${realtime.windDir} with an average speed of ${realtime.windAvg10m} mph!`);
// Output: The wind blows from SW with an average speed of 23.12 mph!
```
- **Converting** the weather data automatically to the **desired units**
```ts
const device = await VantPro2Interface.create({ 
    units: {
        temperature: "°C",
        wind: "km/h",
        rain: "mm",
        ...
    },
    ....
});

const realtime = await device.getRichRealtimeData();
console.log(`It's ${realtime.tempIn} °C`);
// It's 23.1233 °C
```
- and more (read the [docs](https://harrydehix.github.io/vantjs/index.html)!)

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
