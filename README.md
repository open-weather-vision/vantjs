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
// Output: It's 23.1233 °C
```
- and more (read the [docs](https://harrydehix.github.io/vantjs/index.html)!)

# Installation

```
npm install vantjs
```



# Getting Started

Read an introductory guide [here](/guides/1-getting-started.md).

# Documentation

Read the full documentation [here](https://harrydehix.github.io/vantjs/).
