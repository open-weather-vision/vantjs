/**
 * Describes the events fired by the {@link VantInterface}.
 */
export interface WeatherStationEvents {
    /** Fires when the connection to the vantage console closes. */
    disconnect: () => void;
    
    /** Fires when the connection to the vantage console has been established successfully and the console is awake. */
    connect: () => void;

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
