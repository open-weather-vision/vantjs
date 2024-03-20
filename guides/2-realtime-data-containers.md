# An introduction to realtime data containers

This quick guide will introduce you to _realtime data containers_. A much easier, stable and efficient solution for accessing your weather data, built on top of the `VantInterface` classes.

## What are realtime data containers?

Realtime data containers provide **another level of abstraction** to interact with your weather station. Instead of manually calling methods like `VantInterface.getHighsAndLows` or `VantPro2Interface.getRichRealtimeData`, you just create a realtime data container and directly access the desired properties holding current temperature, humidity, pressure, etc. 

**Example:** To get the current _outside temperature_ you just create a realtime data container and access it using `container.tempOut`. This value is updated frequently in the background.
```ts
const container = await SmallRealtimeDataContainer.create({...});
console.log("Outside it's " + container.tempOut + "°F!");

container.on("update", () -> {
    updateMyUI(container); // For example you could update your UI here
    createDatabaseRecord(container); // Or create a database record 
});
```

Internally this works via an **update cycle**. Every `container.settings.updateInterval` seconds the container uses an interface (like `VantInterface`) to update its properties. As the realtime data container is an `EventEmitter`, you can listen to the `"update"` event. Additionally there is the `"valid-update"` event which only fires if no error occurrs. There are also promise based methods like `waitForUpdate` or `waitForValidUpdate`.

Realtime data containers provide **another level of stability**. If the console disconnects from your computer the realtime data container stays alive waiting for the console to reconnect. This makes live monitoring very easy! The events `"device-close"` and  `"device-open"` are fired when the console disconnects or connects. If an update fails (e.g. because the weather station is disconnected) all properties are set to `null`.

## Creating a realtime data container

Using a realtime data container is _very easy_. You simply access its properties and wait for events if you want regular updates! Creating a realtime data container is the most difficult task.

### Two different containers

First of all: There are two different realtime data containers. The `SmallRealtimeDataContainer` provides less weather data but works on all vantage consoles. The `BigRealtimeDataContainer` provides more weather data but only works on Vantage Pro 2 and Vue (having firmware dated after April 24, 2002 / v1.90 or above).
In the following section I explain everything using the smaller variant, but keep in mind, everything works the same way with the big realtime container.

### create()

To create a realtime data container you call the static method `SmallRealtimeDataContainer.create({...})`. As nearly all methods of vantjs, this method is returning a `Promise`. It is therefore recommended to use an asynchronous wrapper method and use the `await` syntax, as this makes the code more readable.

```ts
import { SmallRealtimeDataContainer } from "vantjs/realtime-data-containers";
import { DeviceModel } from "vantjs/realtime-data-containers/settings";
// or
const { SmallRealtimeDataContainer } = require("vantjs/realtime-data-containers");
const { DeviceModel } = require("vantjs/realtime-data-containers/settings");

async function main() {
    const container = await SmallRealtimeDataContainer.create({
        path: "COM4",
        rainCollectorSize: "0.2mm",
        model: DeviceModel.VantagePro2
    });

    // access data from your weather station
    console.log("Outside it's " + container.tempOut + "°F!");

    // if you don't use your realtime data container anymore, make sure to close it!
    container.stop(); 
}

main();
```

When creating a realtime data container, specify:

-   **required** `path`: Path to serial port. Defines the channel used to communicate with the weather station.
-   **required** `rainCollectorSize`: Your weather station's rain collector size. Possible sizes are `"0.1in"`, `"0.2mm"` and `"0.1mm"`.
-   **required** `model`: The model of the connected weather station. Possible values are `DeviceModel.VantagePro`, `DeviceModel.VantagePro2` and `DeviceModel.VantageVue`.
-   _optional_ `updateInterval`: The interval (in seconds) the container updates itself. Default is `60` seconds.
-   _optional_ `baudRate`: The used baud rate (learn more [here](https://open-weather-vision.github.io/vantjs/interfaces/interfaces_settings.MinimumVantInterfaceSettings.html#baudRate))
-   _optional_ `units`: Your desired unit settings (learn more [here](https://open-weather-vision.github.io/vantjs/modules/units.html#UnitSettings))
-   _optional_ `onCreate`: The action automatically to perform on creating the container (learn more [here](https://open-weather-vision.github.io/vantjs/enums/realtime_data_containers_settings.OnContainerCreate.html))

The most importing thing to specify is the serial port's path. This defines the channel used to communicate with the weather station.

### Events overview

There are six important events that are fired by the realtime data container.
You can listen to them using the well known
```ts
container.on("event", () -> {
    console.log("Do something!");
});
```
syntax.

#### `"start"` and `"stop"`

These events are fired when the realtime data container is started or stopped.

#### `"device-open"` and `"device-close"`

These events are fired when the realtime data container loses the connection to the weather station or reconnecting succeeds.

*Yes, if you unplug your weather station the realtime data container stays alive and waits for the console to be plugged back in! The realtime data container never kills itself.*

#### `"update"` and `"valid-update"`

These events are fired when the weather data is updated. Sometimes updates fail, e.g. because the console is disconnected. The `"valid-update"` only fires if everything succeeds.
