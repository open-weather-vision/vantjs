/**
 * Configures the units to use. Doesn't have to match the units displayed on your console.
 * Can be passed to an interface or a realtime data container.
 */
export type UnitSettings = {
    readonly wind: "km/h" | "mph" | "ft/s" | "knots" | "Bft" | "m/s";
    readonly temperature: "°C" | "°F";
    readonly pressure: "hPa" | "inHg" | "mmHg" | "mb";
    readonly solarRadiation: "W/m²";
    readonly rain: "in" | "mm";
};
