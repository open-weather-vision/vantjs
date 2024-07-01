import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";
import { TypedEmitter } from "tiny-typed-emitter";

import {
    WeatherStation, WeatherStationAdvanced
} from "../weather-station";
import {
    RealtimeInterfaceSettings,
    MinimumRealtimeInterfaceSettings,
} from "./settings";
import { RealtimeInterfaceEvents } from "./events";
import { sleep } from "vant-environment/utils";

/**
 * Base class for the {@link SmallRealtimeDataContainer} and the {@link BigRealtimeDataContainer}.
 */
export default abstract class RealtimeDataContainer<
    Station extends WeatherStation | WeatherStationAdvanced
> extends TypedEmitter<RealtimeInterfaceEvents> {
    /**
     *  By default, a maximum of 10 listeners can be registered for any single event. This limit can be changed for individual realtime interface instances using the {@link setMaxListeners} method.
     *
     *  To change the default for all instances, this property can be used. If this value is not a positive number, a RangeError is thrown.
     */
    public static defaultMaxListeners: number;

    /**
     * Adds an event listener. Possible events are described {@link RealtimeInterfaceEvents here}.
     * @param eventName The event to listen for
     * @param listener The listener to add
     * @returns this (for chaining calls)
     */
    public addListener<U extends keyof RealtimeInterfaceEvents>(
        eventName: U,
        listener: RealtimeInterfaceEvents[U]
    ): this {
        return super.addListener(eventName, listener);
    }

    /**
     * Removes the specified listener from the listener array for the event named `eventName`.
     * @param eventName the event the listener listens to
     * @param listener the listener to remove
     * @returns this (for chaining calls)
     */
    public removeListener<U extends keyof RealtimeInterfaceEvents>(
        eventName: U,
        listener: RealtimeInterfaceEvents[U]
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
    public emit<U extends keyof RealtimeInterfaceEvents>(
        eventName: U,
        ...args: Parameters<RealtimeInterfaceEvents[U]>
    ): boolean {
        return super.emit(eventName, ...args);
    }

    /**
     * Returns an array listing the events for which the realtime interface has registered listeners.
     * @returns an array listing the events for which the realtime interface has registered listeners
     */
    public eventNames<U extends keyof RealtimeInterfaceEvents>(): U[] {
        return super.eventNames();
    }

    /**
     * Returns the current max listener value for the realtime interface which is either set by {@link setMaxListeners} or defaults to {@link defaultMaxListeners}.
     * @returns the current max listener value for the current realtime interface instance
     */
    public getMaxListeners(): number {
        return super.getMaxListeners();
    }

    /**
     * Returns the number of listeners listening to the event named `eventName`.
     * @param eventName
     * @returns the number of listeners listening to the event
     */
    public listenerCount(type: keyof RealtimeInterfaceEvents): number {
        return super.listenerCount(type);
    }

    /**
     * Returns a copy of the array of listeners for the event named `eventName`.
     * @param eventName
     * @returns a copy of the array of listeners for the passed event
     */
    public listeners<U extends keyof RealtimeInterfaceEvents>(
        eventName: U
    ): RealtimeInterfaceEvents[U][] {
        return super.listeners(eventName);
    }

    /**
     * Alias for {@link removeListener}.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public off<U extends keyof RealtimeInterfaceEvents>(
        eventName: U,
        listener: RealtimeInterfaceEvents[U]
    ): this {
        return super.off(eventName, listener);
    }

    /**
     * Alias for {@link addListener}.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public on<U extends keyof RealtimeInterfaceEvents>(
        eventName: U,
        listener: RealtimeInterfaceEvents[U]
    ): this {
        return super.on(eventName, listener);
    }

    /**
     * Adds a one-time listener function for the event named eventName. The next time eventName is triggered, this listener is removed and then invoked.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public once<U extends keyof RealtimeInterfaceEvents>(
        eventName: U,
        listener: RealtimeInterfaceEvents[U]
    ): this {
        return super.once(eventName, listener);
    }

    /**
     * By default, a maximum of 10 listeners can be registered for any single event. This limit can be changed for individual realtime interface instances using this method.
     *
     * To change the default for all EventEmitter instances, change {@link defaultMaxListeners}.
     *
     * @param maxListeners new limit for the amount of listeners for any single event on this realtime interface instance
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
    public prependListener<U extends keyof RealtimeInterfaceEvents>(
        eventName: U,
        listener: RealtimeInterfaceEvents[U]
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
    public prependOnceListener<U extends keyof RealtimeInterfaceEvents>(
        eventName: U,
        listener: RealtimeInterfaceEvents[U]
    ): this {
        return super.prependOnceListener(eventName, listener);
    }

    /**
     * Removes all listeners, or those of the specified `eventName`.
     * @param eventName
     * @returns this (for chaining calls)
     */
    public removeAllListeners(
        eventName?: keyof RealtimeInterfaceEvents
    ): this {
        return super.removeAllListeners(eventName);
    }

    /**
     * The default realtime interface settings.
     */
    private static defaultSettings: RealtimeInterfaceSettings = merge(WeatherStation.defaultSettings, {
        updateInterval: 60
    });

    /**
     * The realtime interface's settings. Immutable.
     */
    public readonly settings: RealtimeInterfaceSettings;

    /**
     * The currently internally used interface
     */
    protected station: Station;

    /**
     * The currently active update interval
     */
    private currentUpdateInterval: NodeJS.Timeout | null = null;

    private updateCycleState: "running" | "paused" = "paused";

    /**
     * Creates a new instance and merges the passed settings with the default settings.
     * @param settings the realtime interface's settings
     */
    protected constructor(
        settings: MinimumRealtimeInterfaceSettings,
        weatherStation: Station
    ) {
        super();
        this.station = weatherStation;
        this.settings = merge(
            cloneDeep(RealtimeDataContainer.defaultSettings),
            settings
        );
        this.updateCycleState = "running";
        this.nextUpdate();
        this.emit("start");
    }

    /**
     * Pauses the update cycle, fires a `"pause"` event.
     * Does not close the connection to the weather station.
     */
    public pause = () => {
        this.updateCycleState = "paused";
        this.emit("pause");
    };

    /**
     * Resumes the update cycle, fires a `"start"` event.
     * Does not close the connection to the weather station.
     */
    public resume = () => {
        if(this.updateCycleState === "running") return;
        this.updateCycleState = "running";
        this.emit("start");
        this.nextUpdate();
    };

    /**
     * Waits for the next update on the realtime interface. If an error occurrs while updating
     * an error is returned (not thrown!). This can be used to handle errors optionally. See {@link RealtimeInterfaceEvents}.
     *
     * @example
     * ```ts
     * const err = await container.waitForUpdate();
     * ```
     */
    public waitForUpdate = (): Promise<void | any> => {
        return new Promise<any>((resolve, reject) => {
            this.once("update", (err: any) => {
                if (err) {
                    resolve(err);
                } else {
                    resolve(undefined);
                }
            });
        });
    };

    /**
     * Waits for the next valid update on the realtime interface. See {@link RealtimeInterfaceEvents}.
     */
    public waitForValidUpdate = () => {
        return new Promise<void>((resolve) => {
            this.once("valid-update", async () => {
                resolve();
            });
        });
    };

    /**
     * Triggers the next update (recursively).
     * @hidden
     */
    protected nextUpdate = async() => {
        try {
            await this.updateData();
            this.emit("update");
            this.emit("valid-update");
        } catch (err) {
            this.emit("update", err);
        }
        if(this.updateCycleState === "running"){
            await sleep(this.settings.updateInterval * 1000);
            if(this.updateCycleState === "running"){
                this.nextUpdate();
            }
        }
    };

    /**
     * In this method an extending class should specify the update process of the realtime interface.
     * @hidden
     */
    protected abstract updateData(): Promise<void>;
}
