/**
 * Different actions to perform automatically on creating a realtime data container.
 */
export enum OnContainerCreate {
    /**
     * Does nothing. If you choose this option, you must open the realtime data container with {@link SmallRealtimeDataContainer.open} / {@link BigRealtimeDataContainer.open}.
     */
    DoNothing = 1,

    /**
     * Opens the serial connection to the vantage console. The weather station automatically gets woken up on every update.
     */
    Open = 2,

    /**
     * Opens the serial connection to the vantage console and waits for the first update (the update can also be invalid).
     * The weather station automatically gets woken up on every update.
     */
    WaitForFirstUpdate = 3,

    /**
     * **Default setting**. Opens the serial connection to the vantage console and waits for the first valid update.
     * The weather station automatically gets woken up on every update.
     */
    WaitForFirstValidUpdate = 4,
}
