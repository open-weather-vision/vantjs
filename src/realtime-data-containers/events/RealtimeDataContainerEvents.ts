/**
 * Describes the events fired by the {@link SmallRealtimeDataContainer} and the {@link BigRealtimeDataContainer}.
 */
export interface RealtimeDataContainerEvents {
    /** Fires when the realtime data container is closed. */
    open: () => void;
    /** Fires when the realtime data container is opened. */
    close: () => void;
    /** Fires when the realtime data container got updated. If an error occurrs while updating an error object is supplied. If you only want to listen
     *  for valid updates consider listening for the `"valid-update"` event.
     */
    update: (err?: any | undefined) => void;
    /** Fires when the realtime data container got updated successfully. */
    "valid-update": () => void;
}
