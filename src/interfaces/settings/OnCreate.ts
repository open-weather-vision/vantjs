/**
 * Different actions to perform automatically on creating an interface.
 */
export enum OnCreate {
    /**
     * Does nothing.
     */
    DoNothing = 1,
    /**
     * Opens the serial connection to the vantage console. Remember that
     * the console also needs to be woken up. Consider using {@link OpenAndWakeUp} instead.
     */
    Open = 2,
    /**
     * Opens the serial connection to the vantage console and wakes it up. This is the default value.
     */
    OpenAndWakeUp = 3,
}
