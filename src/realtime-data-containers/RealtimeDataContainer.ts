import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";
import { TypedEmitter } from "tiny-typed-emitter";

import {
    VantInterface,
    VantPro2Interface,
    VantVueInterface,
    VantProInterface,
} from "../interfaces";
import { defaultUnitSettings } from "../units/defaultUnitSettings";
import {
    RealtimeDataContainerSettings,
    MinimumRealtimeDataContainerSettings,
    DeviceModel,
} from "./settings";
import { RealtimeDataContainerEvents } from "./events";
import { OnContainerCreate } from "./settings/OnContainerCreate";
import { OnInterfaceCreate } from "../interfaces/settings";

/**
 * Base class for the {@link SmallRealtimeDataContainer} and the {@link BigRealtimeDataContainer}.
 */
export default abstract class RealtimeDataContainer<
    Interface extends VantInterface,
    SupportedDeviceModels extends DeviceModel
> extends TypedEmitter<RealtimeDataContainerEvents> {
    /**
     *  By default, a maximum of 10 listeners can be registered for any single event. This limit can be changed for individual realtime data container instances using the {@link setMaxListeners} method.
     *
     *  To change the default for all instances, this property can be used. If this value is not a positive number, a RangeError is thrown.
     */
    public static defaultMaxListeners: number;

    /**
     * Adds an event listener. Possible events are described {@link RealtimeDataContainerEvents here}.
     * @param eventName The event to listen for
     * @param listener The listener to add
     * @returns this (for chaining calls)
     */
    public addListener<U extends keyof RealtimeDataContainerEvents>(
        eventName: U,
        listener: RealtimeDataContainerEvents[U]
    ): this {
        return super.addListener(eventName, listener);
    }

    /**
     * Removes the specified listener from the listener array for the event named `eventName`.
     * @param eventName the event the listener listens to
     * @param listener the listener to remove
     * @returns this (for chaining calls)
     */
    public removeListener<U extends keyof RealtimeDataContainerEvents>(
        eventName: U,
        listener: RealtimeDataContainerEvents[U]
    ): this {
        return super.removeListener(eventName, listener);
    }

    /**
     * Synchronously calls each of the listeners registered for the event `eventName`, in the order they were registered, passing the supplied arguments to each.
     * Returns `true` if the event had listeners, `false` otherwise.
     * @param eventName
     * @param args
     * @returns whether the event had listeners
     */
    public emit<U extends keyof RealtimeDataContainerEvents>(
        eventName: U,
        ...args: Parameters<RealtimeDataContainerEvents[U]>
    ): boolean {
        return super.emit(eventName, ...args);
    }

    /**
     * Returns an array listing the events for which the realtime data container has registered listeners.
     * @returns an array listing the events for which the realtime data container has registered listeners
     */
    public eventNames<U extends keyof RealtimeDataContainerEvents>(): U[] {
        return super.eventNames();
    }

    /**
     * Returns the current max listener value for the realtime data container which is either set by {@link setMaxListeners} or defaults to {@link defaultMaxListeners}.
     * @returns the current max listener value for the current realtime data container instance
     */
    public getMaxListeners(): number {
        return super.getMaxListeners();
    }

    /**
     * Returns the number of listeners listening to the event named `eventName`.
     * @param eventName
     * @returns the number of listeners listening to the event
     */
    public listenerCount(type: keyof RealtimeDataContainerEvents): number {
        return super.listenerCount(type);
    }

    /**
     * Returns a copy of the array of listeners for the event named `eventName`.
     * @param eventName
     * @returns a copy of the array of listeners for the passed event
     */
    public listeners<U extends keyof RealtimeDataContainerEvents>(
        eventName: U
    ): RealtimeDataContainerEvents[U][] {
        return super.listeners(eventName);
    }

    /**
     * Alias for {@link removeListener}.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public off<U extends keyof RealtimeDataContainerEvents>(
        eventName: U,
        listener: RealtimeDataContainerEvents[U]
    ): this {
        return super.off(eventName, listener);
    }

    /**
     * Alias for {@link addListener}.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public on<U extends keyof RealtimeDataContainerEvents>(
        eventName: U,
        listener: RealtimeDataContainerEvents[U]
    ): this {
        return super.on(eventName, listener);
    }

    /**
     * Adds a one-time listener function for the event named eventName. The next time eventName is triggered, this listener is removed and then invoked.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public once<U extends keyof RealtimeDataContainerEvents>(
        eventName: U,
        listener: RealtimeDataContainerEvents[U]
    ): this {
        return super.once(eventName, listener);
    }

    /**
     * By default, a maximum of 10 listeners can be registered for any single event. This limit can be changed for individual realtime data container instances using this method.
     *
     * To change the default for all EventEmitter instances, change {@link defaultMaxListeners}.
     *
     * @param maxListeners new limit for the amount of listeners for any single event on this realtime data container instance
     * @returns this (for chaining calls)
     */
    public setMaxListeners(maxListeners: number): this {
        return super.setMaxListeners(maxListeners);
    }

    /**
     * Adds the listener function to the beginning of the listeners array for the event named `eventName`.
     * No checks are made to see if the listener has already been added. Multiple calls passing the same combination of `eventName`
     * and listener will result in the listener being added, and called, multiple times.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public prependListener<U extends keyof RealtimeDataContainerEvents>(
        eventName: U,
        listener: RealtimeDataContainerEvents[U]
    ): this {
        return super.prependListener(eventName, listener);
    }

    /**
     * Adds a one-time listener function for the event named `eventName` to the beginning of the listeners array.
     * The next time `eventName` is triggered, this listener is removed, and then invoked.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public prependOnceListener<U extends keyof RealtimeDataContainerEvents>(
        eventName: U,
        listener: RealtimeDataContainerEvents[U]
    ): this {
        return super.prependOnceListener(eventName, listener);
    }

    /**
     * Removes all listeners, or those of the specified `eventName`.
     * @param eventName
     * @returns this (for chaining calls)
     */
    public removeAllListeners(
        eventName?: keyof RealtimeDataContainerEvents
    ): this {
        return super.removeAllListeners(eventName);
    }

    /**
     * The default realtime data container settings.
     */
    private static defaultSettings = {
        baudRate: 19200,
        updateInterval: 60,
        onCreate: OnContainerCreate.WaitForFirstValidUpdate,
        units: defaultUnitSettings,
    };

    /**
     * The realtime data container's settings. Immutable.
     */
    public readonly settings: RealtimeDataContainerSettings<SupportedDeviceModels>;

    /**
     * The currently internally used interface
     */
    protected currentDevice: Interface | null = null;

    /**
     * The currently active update interval
     */
    private currentUpdateInterval: NodeJS.Timeout | null = null;

    /**
     * Whether the serial port connection to the console is open.
     */
    public get isPortOpen() {
        if (!this.currentDevice) {
            return false;
        }
        return this.currentDevice.isPortOpen;
    }

    /**
     * Whether the realtime data container is running.
     */
    public get isRunning() {
        return this.currentUpdateInterval !== null;
    }

    /**
     * Creates a new instance and merges the passed settings with the default settings.
     * @param settings the realtime data container's settings
     */
    protected constructor(
        settings: MinimumRealtimeDataContainerSettings<SupportedDeviceModels>
    ) {
        super();
        this.settings = merge(
            cloneDeep(RealtimeDataContainer.defaultSettings),
            settings
        );
    }

    /**
     * Performs the {@link OnContainerCreate onCreate} action on the passed container.
     * @param container
     * @returns the container
     */
    protected static async performOnCreateAction<
        W extends RealtimeDataContainer<any, any>
    >(container: W): Promise<W> {
        switch (container.settings.onCreate) {
            case OnContainerCreate.DoNothing:
                break;
            case OnContainerCreate.Start:
                await container.start();
                break;
            case OnContainerCreate.StartAndWaitUntilOpen:
                await container.startAndWaitUntilOpen();
                break;
            case OnContainerCreate.WaitForFirstUpdate:
                container.start();
                await container.waitForUpdate();
                break;
            case OnContainerCreate.WaitForFirstValidUpdate:
                container.start();
                await container.waitForValidUpdate();
                break;
        }
        return container;
    }

    /**
     * Stops the realtime data container, fires a `"close"` event. The update cycle is stopped and the connection to the
     * weather station gets closed.
     *
     * If the realtime data container already got closed no `"close"` event is thrown.
     */
    public stop = () => {
        return new Promise<void>((resolve) => {
            if (this.currentUpdateInterval) {
                clearInterval(this.currentUpdateInterval);
                this.currentUpdateInterval = null;
            }

            if (this.currentDevice) {
                this.currentDevice.close().then(() => {
                    this.currentDevice = null;
                    this.emit("stop");
                    resolve();
                });
            } else {
                this.currentDevice = null;
                resolve();
            }
        });
    };

    /**
     * Starts the realtime data container. Fires a `"start"` event. Doesn't wait for the serial port connection to be opened.
     *
     * Starts the update cycle and tries to connect to the weather station console. If connecting fails,
     * the realtime data container tries to reconnect every `settings.updateInterval` seconds.
     *
     * If the container already got started it is stopped first.
     */
    public start = () => {
        return new Promise<void>((resolve) => {
            this.stop().then(async () => {
                await this.setupInterface();

                const currentDevice = this.currentDevice as Interface;
                this.startUpdateCycle(currentDevice);

                currentDevice.on("open", () => {
                    this.emit("device-open");
                });

                currentDevice.on("close", () => {
                    this.emit("device-close");
                });

                currentDevice.open();

                this.emit("start");
                resolve();
            });
        });
    };

    /**
     * Starts the realtime data container and waits for the serial port connection to be opened.
     *
     * Starts the update cycle and tries to connect to the weather station console. If connecting fails,
     * the realtime data container tries to reconnect every `settings.updateInterval` seconds.
     *
     * If the container got already started it is stopped first.
     */
    public startAndWaitUntilOpen = () => {
        return new Promise<void>((resolve) => {
            this.stop().then(async () => {
                await this.setupInterface();

                const currentDevice = this.currentDevice as Interface;
                this.startUpdateCycle(currentDevice);

                currentDevice.on("open", () => {
                    this.emit("device-open");
                });

                currentDevice.on("close", () => {
                    this.emit("device-close");
                });

                await currentDevice.open();

                this.emit("start");
                resolve();
            });
        });
    };

    /**
     * Waits for the next update on the realtime data container. If an error occurrs while updating
     * the promise is rejected. This can be used to handle errors. See {@link RealtimeDataContainerEvents}.
     *
     * @example
     * ```ts
     * try{
     *    await container.waitForUpdate();
     *     // ...
     * }catch(err){
     *    // handle error
     * }
     * ```
     */
    public waitForUpdate = (): Promise<void | any> => {
        return new Promise<void>((resolve, reject) => {
            this.once("update", (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    /**
     * Waits for the next valid update on the realtime data container. See {@link RealtimeDataContainerEvents}.
     */
    public waitForValidUpdate = () => {
        return new Promise<void>((resolve) => {
            this.once("valid-update", async () => {
                resolve();
            });
        });
    };

    /**
     * Creates the internally used interface (dependent on the passed device model) and opens the connection to the weather station console.
     */
    private setupInterface = async () => {
        const { path, model, baudRate, rainCollectorSize, units } =
            this.settings;
        switch (model) {
            case DeviceModel.VantagePro2:
                this.currentDevice = (await VantPro2Interface.create({
                    path,
                    baudRate,
                    rainCollectorSize,
                    units,
                    onCreate: OnInterfaceCreate.DoNothing,
                })) as any;
                break;
            case DeviceModel.VantageVue:
                this.currentDevice = (await VantVueInterface.create({
                    path,
                    baudRate,
                    rainCollectorSize,
                    units,
                    onCreate: OnInterfaceCreate.DoNothing,
                })) as any;
                break;
            case DeviceModel.VantagePro:
                this.currentDevice = (await VantProInterface.create({
                    path,
                    baudRate,
                    rainCollectorSize,
                    units,
                    onCreate: OnInterfaceCreate.DoNothing,
                })) as any;
                break;
        }
    };

    /**
     * Starts the update cycle (using the passed interface).
     * @param device the interface to the device
     */
    private startUpdateCycle = (device: Interface) => {
        const update = async () => {
            try {
                try {
                    await device.open();
                    await device.wakeUp();
                } catch (err) {
                    await this.onConnectionError();
                    throw err;
                }

                try {
                    await this.onUpdate(device);
                } catch (err) {
                    await this.onConnectionError();
                    throw err;
                }

                this.emit("update");
                this.emit("valid-update");
            } catch (err) {
                this.emit("update", err);
            }
        };

        update();
        this.currentUpdateInterval = setInterval(
            update,
            this.settings.updateInterval * 1000
        );
    };

    /**
     * Gets called if an error occurrs while updating the weather data.
     */
    protected abstract onConnectionError(): Promise<void>;

    /**
     * In this method an extending class should specify the update process of the realtime data container.
     */
    protected abstract onUpdate(device: Interface): Promise<void>;
}
