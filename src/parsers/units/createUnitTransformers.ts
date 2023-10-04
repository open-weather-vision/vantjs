import {
    ElevationUnit,
    HumidityUnit,
    PressureUnit,
    RainUnit,
    SoilMoistureUnit,
    SoilMoistureUnits,
    SolarRadiationUnit,
    TemperatureUnit,
    UnitConfiguration,
    UnitSettings,
    WindUnit,
} from "vant-environment/units";

const transformerCreators = {
    rain(targetUnit: RainUnit) {
        switch (targetUnit) {
            case "in":
                return (val: number | null) => val;
            case "mm":
                return (val: number | null) =>
                    val !== null ? val * 25.4 : null;
        }
    },

    elevation(targetUnit: ElevationUnit) {
        switch (targetUnit) {
            case "in":
                return (val: number | null) => val;
            case "m":
                return (val: number | null) =>
                    val !== null ? val * 0.0254 : null;
        }
    },

    wind(targetUnit: WindUnit) {
        switch (targetUnit) {
            case "mph":
                return (val: number | null) => val;
            case "km/h":
                return (val: number | null) =>
                    val !== null ? val * 1.609344 : null;
            case "ft/s":
                return (val: number | null) =>
                    val !== null ? val * 1.4666666666666666 : null;
            case "knots":
                return (val: number | null) =>
                    val !== null ? val * 0.8689762419006478 : null;
            case "m/s":
                return (val: number | null) =>
                    val !== null ? val * 0.44704 : null;
            case "Bft":
                return (val: number | null) => {
                    if (val === null) return null;
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

    temperature(targetUnit: TemperatureUnit) {
        switch (targetUnit) {
            case "°F":
                return (val: number | null) => val;
            case "°C":
                return (val: number | null) =>
                    val !== null ? (val - 32) * (5 / 9) : null;
        }
    },

    pressure(targetUnit: PressureUnit) {
        switch (targetUnit) {
            case "inHg":
                return (val: number | null) => val;
            case "mb":
            case "hPa":
                return (val: number | null) =>
                    val !== null ? val * 33.86389 : null;
            case "mmHg":
                return (val: number | null) =>
                    val !== null ? val * 25.4000003000246 : null;
        }
    },

    solarRadiation(targetUnit: SolarRadiationUnit) {
        switch (targetUnit) {
            case "W/m²":
                return (val: number | null) => val;
        }
    },

    humidity(targetUnit: HumidityUnit) {
        return (val: number | null) => val;
    },

    soilMoisture(targetUnit: SoilMoistureUnit) {
        return (val: number | null) => val;
    },
};

export type UnitTransformers = {
    [K in keyof UnitConfiguration]: (val: number | null) => number | null;
};

export default function (settings: UnitSettings): UnitTransformers {
    return {
        elevation: transformerCreators.elevation(settings.elevation),
        evoTranspiration: transformerCreators.rain(settings.rain),
        humidity: transformerCreators.humidity(settings.humidity),
        leafTemperature: transformerCreators.temperature(
            settings.leafTemperature
        ),
        pressure: transformerCreators.pressure(settings.pressure),
        rain: transformerCreators.rain(settings.rain),
        soilMoisture: transformerCreators.soilMoisture(settings.soilMoisture),
        soilTemperature: transformerCreators.temperature(
            settings.soilTemperature
        ),
        solarRadiation: transformerCreators.solarRadiation(
            settings.solarRadiation
        ),
        temperature: transformerCreators.temperature(settings.temperature),
        wind: transformerCreators.wind(settings.wind),
    };
}
