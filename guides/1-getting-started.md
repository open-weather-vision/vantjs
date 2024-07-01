# Getting started

This quick start guide will introduce you to vantjs. After reading this guide, you will be able to retrieve the
first realtime data (temperature, pressure, humidity, wind, ...) directly from your weather station.

### Steps

1. [Connect the vantage console serially to your computer](#1-connect-the-vantage-console-serially-to-your-computer)
2. [Install the _vantjs_ package](#2-install-the-vantjs-package)
3. [Get the first realtime data from your weather station](#3-get-the-first-realtime-data-from-your-weather-station)

## 1. Connect the vantage console serially to your computer

The vantjs library needs your console to be connected serially to your computer. A possible setup would be to use the datalogger (also the USB version) and install the correct driver after that. The tool to install the correct driver is [**CP210X USB to Serial Converter**](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers?tab=downloads). This utility is also included in the Weather Link software. You can run it from the Windows Start menu by selecting _WeatherLink_ **>** _CP210X USB to Serial Converter_.

## 2. Install the vantjs package

Now that your weather station is serially connected, _vantjs_ can be easily installed via npm.

```shell
npm install vantjs
```

## 3. Get the first realtime data from your weather station

Now let's create a new javascript/typescript file and start coding!

#### 1. Creating the interface

To connect to your weather station you have to create a `WeatherStation` instance.
This instance is like a direct communication channel to your vantage console.

To create an instance use the `WeatherStation.connect(...)` method. As nearly all methods of vantjs, this method is returning a `Promise`. It is therefore recommended to use an asynchronous wrapper method, as this makes the code more readable.

```ts
import { WeatherStation } from "vantjs/weather-station";
// or
const { WeatherStation } = require("vantjs/weather-station");

async function main() {
    const device = await WeatherStation.connect({
        path: "COM4",
        rainCollectorSize: "0.2mm",
    });

    // access data from your weather station
}

main();
```

When creating a weather station instance, specify:

-   **required** `path`: Path to serial port. Defines the channel used to communicate with the weather station.
-   **required** `rainCollectorSize`: Your weather station's rain collector size. Possible sizes are `"0.1in"`, `"0.2mm"` and `"0.1mm"`.
-   _optional_ `baudRate`: The used baud rate (learn more [here](https://open-weather-vision.github.io/vantjs/interfaces/interfaces_settings.MinimumWeatherStationSettings.html#baudRate))
-   _optional_ `units`: Your desired unit settings (learn more [here](https://open-weather-vision.github.io/vantjs/modules/units.html#UnitSettings))

The most importing thing to specify is the serial port's path. This defines the channel used to communicate with the weather station. The baud rate is also very important. Make sure it matches your console's settings!

If you don't know the serial path, you can use the helper function `waitForNewSerialConnection()`. This function repeatedly checks all available serial devices and resolves a path if a new device is available.

```ts
import { WeatherStation } from "vantjs/weather-station";
import { waitForNewSerialConnection } from "vantjs/utils";
// or
const { WeatherStation } = require("vantjs/weather-station");
const { waitForNewSerialConnection } = require("vantjs/utils");

async function main() {
    console.log("Waiting for new serial connection...");
    const path = await waitForNewSerialConnection();
    // plug in your station at this moment
    console.log("Station detected!");

    const device = await WeatherStation.connect({
        path,
        rainCollectorSize: "0.2mm",
    });
    console.log("Connected :D");

    // access data from your weather station
}

main();
```

#### 2. Getting the realtime data

After creating the station you are ready to retrieve data from your weather station. Let's start simple by getting some `BasicRealtimeData`.

Inside the asyncronous wrapper function (below creating the interface) write the following:

```ts
const [BasicRealtimeData] = await station.getBasicRealtimeData();

console.log("Outside it's " + BasicRealtimeData.tempOut + " °F");
console.log("The wind speed is " + BasicRealtimeData.wind + " mph");
console.log("The wind direction is " + BasicRealtimeData.windDir);
console.log(
    "The current rain rate is " + BasicRealtimeData.rainRate + " in/h"
);
console.log("The current pressure " + BasicRealtimeData.press + " inHg");
console.log("(measured at " + BasicRealtimeData.time.toLocaleString() + ")");
```

The returned `BasicRealtimeData` object contains basic realtime information about temperature,
pressure, humidity, wind speed / direction, rain (rate), et, uv and solar radiation. It is documented in detail [here](https://open-weather-vision.github.io/vantjs/classes/structures.BasicRealtimeData.html). The default units are listed [here](https://open-weather-vision.github.io/vantjs/modules/units.html).

#### 3. Closing the serial connection

After getting the data from your weather station you should close the connection to the console.
Not doing so will prevent the program from exiting.

```ts
await station.disconnect();
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

#### Beyond basic realtime data

_vantjs_ provides much more than just accessing some basic realtime data.

For example:

-   getting daily, monthly and yearly highs and lows
-   getting more - station dependent - realtime weather data (use `WeatherStationAdvanced` instead of `WeatherStation`)
-   repeatedly accessing realtime weather data in a steady interval using realtime data containers
-   toggling the console's background light
-   and much more...

To learn more about these topics read its [official documentation](https://open-weather-vision.github.io/vantjs/).
