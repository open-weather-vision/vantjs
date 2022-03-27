/**
 * Describes the events fired by the {@link VantInterface}.
 */
export interface VantInterfaceEvents {
    /** Fires when the connection to the vantage console closes. */
    close: () => void;
    /** Fires when the vantage console awakes successfully. */
    awakening: () => void;
    /** Fires when the connection to the vantage console opens. */
    open: () => void;

    /**
     * Inherited event. Fires when a new event listener is added. See [here](https://nodejs.org/api/events.html#event-newlistener).
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    newListener: (eventName: string, listener: Function) => void;

    /**
     * Inherited event. Fires when a event listener is removed. See [here](https://nodejs.org/api/events.html#event-removelistener).
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    removeListener: (eventName: string, listener: Function) => void;
}
