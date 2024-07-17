import { BaudRate, RainCollectorSize } from "vant-environment/structures";
import { UnitSettings } from "vant-environment/units";
import { MinimumWeatherStationSettings } from "../../weather-station/settings";

/**
 * The minimum required settings for any realtime data container.
 */
export interface MinimumRealtimeDataContainerSettings{
    /**
     * **Optional**. The interval (_in seconds_) the container updates itself. Default is `60` seconds.
     *
     * On update the `"update"` and the `"valid-update"` (if the update succeeds) event fires.
     *
     * A smaller intervall leads to more up-to-date weather data but also more traffic.
     * 
     * Can be changed on runtime via `container.settings.updateInterval`.
     */
    readonly updateInterval?: number;
}
