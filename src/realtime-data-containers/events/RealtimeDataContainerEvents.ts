/**
 * Describes the events fired by the {@link SmallRealtimeDataContainer} and the {@link BigRealtimeDataContainer}.
 */
export interface RealtimeDataContainerEvents {
    /** Fires when the realtime data container is started. */
    start: () => void;
    /** Fires when the realtime data container is stopped. */
    stop: () => void;
    /** Fires when the connection to the weather station console opens.  */
    "device-open": () => void;
    /** Fires when the connection to the weather station console closes.  */
    "device-close": () => void;
    /** Fires when the realtime data container is updated. If an error occurrs while updating an error object is supplied. If you only want to listen
     *  for valid updates consider listening for the `"valid-update"` event.
     */
    update: (err?: any | undefined) => void;
    /** Fires when the realtime data container is updated successfully. */
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
