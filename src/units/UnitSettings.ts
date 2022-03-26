import { PressureUnits } from "./PressureUnits";
import { RainUnits } from "./RainUnits";
import { SolarRadiationUnits } from "./SolarRadiationUnits";
import { TemperatureUnits } from "./TemperatureUnits";
import { WindUnits } from "./WindUnits";

/**
 * Configures the units to use. Doesn't have to match the units displayed on your console.
 * Can be passed to an interface or a realtime data container.
 */
export type UnitSettings = {
    /**
     * The unit to use for wind speed. Default is `"mph"`.
     */
    readonly wind: WindUnits;

    /**
     * The unit to use for temperature. Default is `"°F"`.
     */
    readonly temperature: TemperatureUnits;

    /**
     * The unit to use for pressure. Default is `"inHg"`.
     */
    readonly pressure: PressureUnits;

    /**
     * The unit to use for solar radiation. Default is `"W/m²"`.
     */
    readonly solarRadiation: SolarRadiationUnits;

    /**
     * The unit to use for rain. Default is `"in"`.
     */
    readonly rain: RainUnits;
};
