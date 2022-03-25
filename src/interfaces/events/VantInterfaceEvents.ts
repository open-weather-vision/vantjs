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
}
