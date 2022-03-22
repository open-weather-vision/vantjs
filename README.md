# vantjs

![npm](https://img.shields.io/npm/v/vantjs) ![GitHub milestones](https://img.shields.io/github/milestones/all/harrydehix/vantjs) ![GitHub last commit](https://img.shields.io/github/last-commit/harrydehix/vantjs)<br>
vantjs is a platform-independent javascript and typescript interface to the Davis Vantage Pro, Pro 2 and Vue. It works on any linux, windows or osx device!

#### Development news

❌ _Development still in progress. Some features are not stable._ <br>
⏩ _Version 0.4.0 has just been released offering a lot of functionality to interact with your Vantage Pro, Pro 2 and Vue._

**Upcoming stuff**:

-   so called _weather data containers_ offering a more abstract way to interact with your weather station hiding
    all the complex details
-   currently I'm working on creating helpful guides and a clean documentation making developing with vantjs fun and easy!

# Installation

```
npm install vantjs
```

# Usage

### Interfaces

The `VantInterface` class provides the basic features that all Vantage stations offer.

```typescript
import { VantInterface, inspect } from "vantjs";

async function main() {
    const device = new VantInterface({ path: "COM4", baudRate: 19200 });

    // Opening the connection to the device
    await device.open();

    // Waking up the device
    await device.wakeUp();

    // Gettings highs and lows
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

### Weather Data Containers

Weather data containers are another level of abstraction hiding all the complex details from you. They are still in development, more news are coming soon.

```js
import { RichRealtimeDataContainer, DeviceModel } from "vantjs";

async function main() {
    const weather = new RichRealtimeDataContainer({
        device: {
            path: "COM4",
            model: DeviceModel.VantagePro2,
            baudRate: 19200,
        },
        // the interval the weather data container is updated
        updateInterval: 4,
    });

    // waiting for the first update to happen
    await weather.firstUpdate();

    // accessing the desired weather data
    console.log(weather.temperature.in + "°F");
    console.log(weather.temperature.out + "°F");

    // closing the connection
    await weather.close();
}

main();
```

# Documentation

_Coming soon!_
