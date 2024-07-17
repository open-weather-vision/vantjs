# An introduction to realtime data containers

This quick guide will introduce you to _realtime data containers_. A much easier solution for accessing your weather data repeatedly, built on top of the `WeatherStation` class.

## What are realtime data containers?

Realtime data containers provide **another level of abstraction** to interact with your weather station. Instead of manually calling methods like `station.getHighsAndLows()` or `station.getDetailedRealtimeData()`, you just create a realtime data container and directly access the desired properties holding current temperature, humidity, pressure, etc. 

**Example:** To get the current _outside temperature_ you just create a realtime data container and access it using `container.tempOut`. This value is updated frequently in the background.
```ts
const container = station.createBasicRealtimeContainer({
    updateInterval: 15 // update interval in seconds
});
await container.waitForUpdate();

console.log("Outside it's " + container.tempOut + "°F!");

container.on("update", () -> {
    updateMyUI(container); // For example you could update your UI here
    createDatabaseRecord(container); // Or create a database record 
});
```

Internally this works via an **update cycle**. Every `container.settings.updateInterval` seconds the container uses an interface (like `WeatherStation`) to update its properties. As the realtime data container is an `EventEmitter`, you can listen to the `"update"` event. Additionally there is the `"valid-update"` event which only fires if no error occurrs. There are also promise based methods like `waitForUpdate` or `waitForValidUpdate`.

## It's simple!

Using a realtime data container is _very easy_. You simply access its properties and wait for events if you want regular updates!

### Two different containers

First of all: There are two different realtime data containers. The `BasicRealtimeDataContainer` provides less weather data but works on all vantage consoles. The `DetailedRealtimeDataContainer` provides more weather data but only works on Vantage Pro 2 and Vue (having firmware dated after April 24, 2002 / v1.90 or above).
In the following section I explain everything using the smaller variant, but keep in mind, everything works the same way with the big realtime container.

### createBasicRealtimeContainer()

To create a realtime data container you first need a connected `WeatherStation` instance. After that call the method `station.createBasicRealtimeContainer({...})`.

```ts
import { SmallRealtimeDataContainer } from "vantjs/realtime-data-containers";
import { DeviceModel } from "vantjs/realtime-data-containers/settings";
// or
const { SmallRealtimeDataContainer } = require("vantjs/realtime-data-containers");
const { DeviceModel } = require("vantjs/realtime-data-containers/settings");

async function main() {
    const station = await WeatherStation.connect({
        path: "COM4",
        rainCollectorSize: "0.2mm"
    });

    const container = station.createBasicRealtimeDataContainer({
        updateInterval: 30, // update interval in seconds (default: 60)
    })

    // access data from your weather station
    console.log("Outside it's " + container.tempOut + "°F!");

    // if you don't use your realtime data container anymore, make sure to pause it!
    container.pause(); 
}

main();
```

When creating a realtime data container, specify:

-   _optional_ `updateInterval`: The interval (in seconds) the container updates itself. Default is `60` seconds.

### Events overview

There are four important events that are fired by the realtime data container.
You can listen to them using the well known
```ts
container.on("event", () -> {
    console.log("Do something!");
});
```
syntax.

#### `"start"` and `"pause"`

These events are fired when the realtime data container is started/resumed or paused.

#### `"update"` and `"valid-update"`

These events are fired when the weather data is updated. Sometimes updates fail, e.g. because the console is disconnected. The `"valid-update"` only fires if everything succeeds.
