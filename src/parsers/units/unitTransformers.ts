import { UnitSettings } from "../../units/UnitSettings";

const transformerCreators = {
    rain(targetUnit: "mm" | "in") {
        switch (targetUnit) {
            case "in":
                return (val: number) => val;
            case "mm":
                return (val: number) => val * 25.4;
        }
    },

    altimeter(targetUnit: "m" | "in") {
        switch (targetUnit) {
            case "in":
                return (val: number) => val;
            case "m":
                return (val: number) => val * 0.0254;
        }
    },

    wind(targetUnit: "km/h" | "mph" | "ft/s" | "knots" | "Bft" | "m/s") {
        switch (targetUnit) {
            case "mph":
                return (val: number) => val;
            case "km/h":
                return (val: number) => val * 1.609344;
            case "ft/s":
                return (val: number) => val * 1.4666666666666666;
            case "knots":
                return (val: number) => val * 0.8689762419006478;
            case "m/s":
                return (val: number) => val * 0.44704;
            case "Bft":
                return (val: number) => {
                    val = val * 0.44704;
                    if (val < 0.5) return 0;
                    if (val <= 1.5) return 1;
                    if (val <= 3.3) return 2;
                    if (val <= 5.5) return 3;
                    if (val <= 7.9) return 4;
                    if (val <= 10.7) return 5;
                    if (val <= 13.8) return 6;
                    if (val <= 17.1) return 7;
                    if (val <= 20.7) return 8;
                    if (val <= 24.4) return 9;
                    if (val <= 28.4) return 10;
                    if (val <= 32.6) return 11;
                    return 12;
                };
        }
    },

    temperature(targetUnit: "°C" | "°F") {
        switch (targetUnit) {
            case "°F":
                return (val: number) => val;
            case "°C":
                return (val: number) => (val - 32) * (5 / 9);
        }
    },

    pressure(targetUnit: "hPa" | "inHg" | "mmHg" | "mb") {
        switch (targetUnit) {
            case "inHg":
                return (val: number | null) => val;
            case "mb":
            case "hPa":
                return (val: number | null) =>
                    val === null ? null : val * 33.86389;
            case "mmHg":
                return (val: number | null) =>
                    val === null ? null : val * 25.4000003000246;
        }
    },

    solarRadiation(targetUnit: "W/m²") {
        switch (targetUnit) {
            case "W/m²":
                return (val: number) => val;
        }
    },
};

export type UnitTransformers = {
    rain: (val: number) => number;
    wind: (val: number) => number;
    temperature: (val: number) => number;
    pressure: (val: number | null) => number | null;
    solarRadiation: (val: number) => number;
};

export function createUnitTransformers(
    unitSettings: UnitSettings
): UnitTransformers {
    return {
        rain: transformerCreators.rain(unitSettings.rain),
        wind: transformerCreators.wind(unitSettings.wind),
        temperature: transformerCreators.temperature(unitSettings.temperature),
        pressure: transformerCreators.pressure(unitSettings.pressure),
        solarRadiation: transformerCreators.solarRadiation(
            unitSettings.solarRadiation
        ),
    };
}
