# vantjs

![](https://badgen.net/npm/v/vantjs)
![](https://badgen.net/npm/dy/vantjs)
![](https://badgen.net/npm/types/vantjs)
![](https://badgen.net/npm/license/vantjs)
![](https://badgen.net/badge/documentation/available/green?icon=wiki)
<br>
vantjs is a platform-independent javascript and typescript interface to the Davis Vantage Pro, Pro 2 and Vue. It works on any linux, windows or osx device!

# Features

-   Getting **hourly, daily, monthly** and **yearly highs and lows** (read more [here](https://harrydehix.github.io/vantjs/classes/structures.HighsAndLows.html))

```ts
const highsAndLows = await device.getHighsAndLows();

console.log(
    `Todays minimum temperature was ${highsAndLows.tempOut.day.low} °F!`
);
// Output: Today's minimum temperature was 25.3 °F!

console.log(
    `The maximum rain rate in the current hour was ${highsAndLows.rainRate.hour} in/h!`
);
// Output: The maximum rain rate in the current hour was 0.2 in/h!
```

-   Getting **realtime weather data** (read more [here](https://harrydehix.github.io/vantjs/classes/structures.RichRealtimeData.html))

```ts
const realtime = await device.getRichRealtimeData();

console.log(`Currently it's ${realtime.tempOut} °F!`);
// Output: Currently it's 45.2 °F!

console.log(
    `The wind blows from ${realtime.windDir} with an average speed of ${realtime.windAvg10m} mph!`
);
// Output: The wind blows from SW with an average speed of 23.12 mph!
```

-   **Converting** the weather data automatically to the **desired units**

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
// Output: It's 23.1233 °C
```

-   and more (read the [docs](https://harrydehix.github.io/vantjs/index.html)!)

# Installation

```bash
npm install vantjs
```

# Getting Started

Read an introductory guide [here](/guides/1-getting-started.md).
Read a guide about realtime data containers [here](/guides/2-realtime-data-containers.md).

# Documentation

Read the full documentation [here](https://harrydehix.github.io/vantjs/).

# Community

This project is updated on demand. If you have discovered a bug or want to suggest a feature🚀, please create an issue [here](https://github.com/harrydehix/vantjs/issues/new/choose).

# Beyond vantjs

_vantjs_ is only a small part of the **Vantage Environment**.

While _vantjs_ provides the direct serial connection to the weather station, the [vant-api](https://github.com/harrydehix/vant-api) provides a convenient interface for this data in the form of a RESTful API for any kind of application. In the background it utilizes [vant-db](https://github.com/harrydehix/vant-db) that manages a database that allows long-term storage and archiving of weather data. The [vant-api](https://github.com/harrydehix/vant-api) package also includes a _recorder_ that utilizes _vantjs_ to repeatedly send weather data to the running REST API. These programs together form a robust platform that allows you to use your weather data pretty much anywhere.

⚠️ The **Vantage Environment** is still in active development. Once it is finished multiple _guides_ will guide you through the process of setting up your very own vantage environment.