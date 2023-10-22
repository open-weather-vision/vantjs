import { WeatherStationSettings } from "../../weather-station/settings";

/**
 * Settings for the {@link BasicRealtimeInterface} and the {@link AdvancedRealtimeInterface}.
 * {@link MinimumRealtimeInterfaceSettings} describes the mimimum required settings to be configured when creating
 * a realtime interface.
 */
export interface RealtimeInterfaceSettings extends WeatherStationSettings{
    /**
     * The interval (_in seconds_) the container updates itself. Default is `60` seconds.
     *
     * On update the `"update"` and the `"valid-update"` (if the update succeeds) event fires.
     *
     * A smaller intervall leads to more up-to-date weather data but also more traffic.
     */
    readonly updateInterval: number;
}
