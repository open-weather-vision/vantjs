/**
 * Different actions to perform automatically on creating a realtime data container.
 */
export enum OnContainerCreate {
    /**
     * Does nothing. If you choose this option, you must manually start the realtime data container with {@link SmallRealtimeDataContainer.start} / {@link BigRealtimeDataContainer.start}.
     */
    DoNothing = 1,

    /**
     * Starts the realtime data container. See {@link SmallRealtimeDataContainer.start} / {@link BigRealtimeDataContainer.start}. Doesn't wait for the
     * serial port connection to be opened.
     */
    Start = 2,

    /**
     * Starts the realtime data container and waits until the serial port connection is open. See {@link SmallRealtimeDataContainer.startAndWaitUntilOpen} / {@link BigRealtimeDataContainer.startAndWaitUntilOpen}.
     */
    StartAndWaitUntilOpen = 3,

    /**
     * Opens the serial connection to the vantage console and waits for the first update (the update can also be invalid).
     * The weather station automatically gets woken up on every update.
     */
    WaitForFirstUpdate = 4,

    /**
     * **Default setting**. Opens the serial connection to the vantage console and waits for the first valid update.
     * The weather station automatically gets woken up on every update.
     */
    WaitForFirstValidUpdate = 5,
}
