import { TypedEmitter } from "tiny-typed-emitter";
import { WeatherStationEvents } from "./events";

export default class WeatherStationEventBase extends TypedEmitter<WeatherStationEvents> {
    /**
     *  By default, a maximum of 10 listeners can be registered for any single event. This limit can be changed for individual WeatherStation instances using the {@link setMaxListeners} method.
     *
     *  To change the default for all EventEmitter instances, this property can be used. If this value is not a positive number, a RangeError is thrown.
     */
    public static defaultMaxListeners: number;

    /**
     * Adds an event listener. Possible events are described {@link WeatherStationEvents here}.
     * @param eventName The event to listen for
     * @param listener The listener to add
     * @returns this (for chaining calls)
     */
    public addListener<U extends keyof WeatherStationEvents>(
        eventName: U,
        listener: WeatherStationEvents[U]
    ): this {
        return super.addListener(eventName, listener);
    }

    /**
     * Removes the specified listener from the listener array for the event named `eventName`.
     * @param eventName the event the listener listens to
     * @param listener the listener to remove
     * @returns this (for chaining calls)
     */
    public removeListener<U extends keyof WeatherStationEvents>(
        eventName: U,
        listener: WeatherStationEvents[U]
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
    public emit<U extends keyof WeatherStationEvents>(
        eventName: U,
        ...args: Parameters<WeatherStationEvents[U]>
    ): boolean {
        return super.emit(eventName, ...args);
    }

    /**
     * Returns an array listing the events for which the WeatherStation has registered listeners.
     * @returns an array listing the events for which the WeatherStation has registered listeners
     */
    public eventNames<U extends keyof WeatherStationEvents>(): U[] {
        return super.eventNames();
    }

    /**
     * Returns the current max listener value for the WeatherStation which is either set by {@link setMaxListeners} or defaults to {@link defaultMaxListeners}.
     * @returns the current max listener value for the current WeatherStation instance
     */
    public getMaxListeners(): number {
        return super.getMaxListeners();
    }

    /**
     * Returns the number of listeners listening to the event named `eventName`.
     * @param eventName
     * @returns the number of listeners listening to the event
     */
    public listenerCount(type: keyof WeatherStationEvents): number {
        return super.listenerCount(type);
    }

    /**
     * Returns a copy of the array of listeners for the event named `eventName`.
     * @param eventName
     * @returns a copy of the array of listeners for the passed event
     */
    public listeners<U extends keyof WeatherStationEvents>(
        eventName: U
    ): WeatherStationEvents[U][] {
        return super.listeners(eventName);
    }

    /**
     * Alias for {@link removeListener}.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public off<U extends keyof WeatherStationEvents>(
        eventName: U,
        listener: WeatherStationEvents[U]
    ): this {
        return super.off(eventName, listener);
    }

    /**
     * Alias for {@link addListener}.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public on<U extends keyof WeatherStationEvents>(
        eventName: U,
        listener: WeatherStationEvents[U]
    ): this {
        return super.on(eventName, listener);
    }

    /**
     * Adds a one-time listener function for the event named eventName. The next time eventName is triggered, this listener is removed and then invoked.
     * @param eventName
     * @param listener
     * @returns this (for chaining calls)
     */
    public once<U extends keyof WeatherStationEvents>(
        eventName: U,
        listener: WeatherStationEvents[U]
    ): this {
        return super.once(eventName, listener);
    }

    /**
     * By default, a maximum of 10 listeners can be registered for any single event. This limit can be changed for individual WeatherStation instances using this method.
     *
     * To change the default for all EventEmitter instances, change {@link defaultMaxListeners}.
     *
     * @param maxListeners new limit for the amount of listeners for any single event on this WeatherStation instance
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
    public prependListener<U extends keyof WeatherStationEvents>(
        eventName: U,
        listener: WeatherStationEvents[U]
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
    public prependOnceListener<U extends keyof WeatherStationEvents>(
        eventName: U,
        listener: WeatherStationEvents[U]
    ): this {
        return super.prependOnceListener(eventName, listener);
    }

    /**
     * Removes all listeners, or those of the specified `eventName`.
     * @param eventName
     * @returns this (for chaining calls)
     */
    public removeAllListeners(eventName?: keyof WeatherStationEvents): this {
        return super.removeAllListeners(eventName);
    }
}
