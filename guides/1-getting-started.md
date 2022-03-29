# Getting started

This quick start guide will introduce you to vantjs. After reading this guide, you will be able to retrieve the
first realtime data (temperature, pressure, humidity, wind, ...) directly from your weather station.

### Steps

1. [Connect the vantage console serially to your computer](#1-connect-the-vantage-console-serially-to-your-computer)
2. [Install the _vantjs_ package](#2-install-the-vantjs-package)
3. [Get the first realtime data from your weather station](#3-get-the-first-realtime-data-from-your-weather-station)

## 1. Connect the vantage console serially to your computer

When you connect your weather station console via the datalogger for the first time, it should be connected serially by default (even if you use the datalogger's USB version).

However, if you have installed the Weather Link software, configured your weather station there, and _selected USB as the communication type_, you will need to run the **CP210X USB to Serial Converter**. This utility is included in the Weather Link software. You can run it from the Windows Start menu by selecting _WeatherLink_ **>** _CP210X USB to Serial Converter_.

## 2. Install the vantjs package

Now that your weather station is serially connected, _vantjs_ can be easily installed via npm.

```shell
npm install vantjs
```

## 3. Get the first realtime data from your weather station

Now let's create a new javascript/typescript file and start coding!

#### 1. Creating the interface

To connect to your weather station you have to create a `VantInterface`.
In _vantjs_ interfaces are the most straightforward way to directly access various kinds of
realtime weather data from your weather station.

This can be done using the `VantInterface.create()` method. As nearly all methods of vantjs, this method is returning a `Promise`. It is therefore recommended to use an asynchronous wrapper method, as this makes the code more readable.

```ts
import { VantInterface } from "vantjs/interfaces";
// or
const { VantInterface } = require("vantjs/interfaces");

async function main() {
    const device = await VantInterface.create({
        path: "COM4",
        rainCollectorSize: "0.2mm",
    });

    // access data from your weather station
}

main();
```

When creating an interface, specify:

-   **required** `path`: Path to serial port. Defines the channel used to communicate with the weather station.
-   **required** `rainCollectorSize`: You weather station's rain collector size. Possible sizes are `"0.1in"`, `"0.2mm"` and `"0.1mm"`.
-   _optional_ `baudRate`: The used baud rate (learn more [here](https://harrydehix.github.io/vantjs/interfaces/interfaces_settings.MinimumVantInterfaceSettings.html#baudRate))
-   _optional_ `units`: Your desired unit settings (learn more [here]())
-   _optional_ `onCreate`: The action automatically to perform on creating the interface (learn more [here](https://harrydehix.github.io/vantjs/interfaces/interfaces_settings.MinimumVantInterfaceSettings.html#units))

The most importing thing to specify is the serial port's path. This defines the channel used to communicate with the weather station.

#### 2. Getting the realtime data

After creating the interface you are ready to retrieve data from your weather station. Let's start simple by getting some `SimpleRealtimeData`.

Inside the asyncronous wrapper function (below creating the interface) write the following:

```ts
const simpleRealtimeData = await device.getSimpleRealtimeData();

console.log("Outside it's " + simpleRealtimeData.tempOut + " °F");
console.log("The wind speed is " + simpleRealtimeData.wind + " mph");
console.log("The wind direction is " + simpleRealtimeData.windDir);
console.log(
    "The current rain rate is " + simpleRealtimeData.rainRate + " in/h"
);
console.log("The current pressure " + simpleRealtimeData.press + " inHg");
console.log("(measured at " + simpleRealtimeData.time.toLocaleString() + ")");
```

The returned `SimpleRealtimeData` object contains basic realtime information about temperature,
pressure, humidity, wind speed / direction, rain (rate), et, uv and solar radiation. It is documented in detail [here](https://harrydehix.github.io/vantjs/classes/structures.SimpleRealtimeData.html). The default units are listed [here](https://harrydehix.github.io/vantjs/modules/units.html).

#### 3. Closing the serial connection

After getting the data from your weather station you should close the connection to the console.
Not doing so will prevent the program from exiting.

```ts
await device.close();
```

#### 4. Run the code!

Running the code should result in something similar to this:

```
Outside it's 71.1 °F
The wind speed is 4 mph
The wind direction is SW
The current rain rate is 0 in/h
The current pressure 30.115 inHg
(measured at 28.3.2022, 15:40:25)
```

Wow, you just accessed some realtime weather data in a few simple steps!

#### Beyond simple realtime data

_vantjs_ provides much more than just accessing some simple realtime data.

For example:

-   getting daily, monthly and yearly highs and lows
-   getting more - station dependent - realtime weather data
-   repeatedly accessing realtime weather data in a steady interval using realtime data containers
-   and much more...

To learn more about these topics read its [official documentation](https://harrydehix.github.io/vantjs/).
