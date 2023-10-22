/**
 * Describes the events fired by the {@link BasicRealtimeInterface} and the {@link AdvancedRealtimeInterface}.
 */
export interface RealtimeInterfaceEvents {
    /** Fires when the realtime interface is started. */
    start: () => void;
    /** Fires when the realtime interface is destroyed. */
    destroy: () => void;
    /** Fires when the connection to the weather station console opens.  */
    "device-connect": () => void;
    /** Fires when the connection to the weather station console closes.  */
    "device-disconnect": () => void;
    /** 
     * Fires when the realtime interface is updated. If an error occurrs while updating an error object is supplied. If you only want to listen
     * for valid updates consider listening for the `"valid-update"` event.
     */
    update: (err?: any | undefined) => void;
    /** Fires when the realtime interface is updated successfully. */
    "valid-update": () => void;
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
