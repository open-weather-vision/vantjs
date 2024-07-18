import { WeatherStationSettings } from "../../weather-station/settings/index.js";

/**
 * Settings for the {@link BasicRealtimeDataContainer} and the {@link DetailedRealtimeDataContainer}.
 * {@link MinimumRealtimeDataContainerSettings} describes the mimimum required settings to be configured when creating
 * a realtime data container.
 */
export interface RealtimeDataContainerSettings{
    /**
     * The interval (_in seconds_) the container updates itself. Default is `60` seconds.
     *
     * On update the `"update"` and the `"valid-update"` (if the update succeeds) event fires.
     *
     * A smaller intervall leads to more up-to-date weather data but also more traffic.
     * 
     * Can be changed on runtime via `container.settings.updateInterval`.
     */
    updateInterval: number;
}
