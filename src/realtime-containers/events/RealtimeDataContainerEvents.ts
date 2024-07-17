import BasicRealtimeDataContainer from "../BasicRealtimeDataContainer";
import DetailedRealtimeDataContainer from "../DetailedRealtimeDataContainer";

/**
 * Describes the events fired by the {@link BasicRealtimeDataContainer} and the {@link DetailedRealtimeDataContainer}.
 */
export interface RealtimeDataContainerEvents {
    /** Fires when the realtime data container's update cycle is started or resumed. */
    start: () => void;

    /** Fires when the realtime data container's update cycle is paused.. */
    pause: () => void;

    /** 
     * Fires when the realtime data container is updated. If an error occurrs while updating an error object is supplied. If you only want to listen
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
