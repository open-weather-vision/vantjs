import ElementHighs from "./subtypes/ElementHighs";
import ElementHighsAndLows from "./subtypes/ElementHighsAndLows";
import ElementLows from "./subtypes/ElementLows";
import RainRateHighs from "./subtypes/RainRateHighs";

/**
 * Holds daily, monthly and yearly highs and lows for all weather elements / sensors.
 *
 * Call {@link VantInterface.getHighsAndLows} to get the current highs and lows from your weather station.
 */
export default class HighsAndLows {
    /**
     * @hidden
     */
    constructor() {}
    /**
     * Pressure's daily, monthly and yearly highs and lows
     */
    public pressure = new ElementHighsAndLows();

    /**
     * Wind speed's daily, monthly and yearly highs
     */
    public wind = new ElementHighs();

    /**
     * Inside temperature's daily, monthly and yearly highs and lows
     */
    public tempIn = new ElementHighsAndLows();

    /**
     * Inside humditity's daily, monthly and yearly highs and lows
     */
    public humIn = new ElementHighsAndLows();

    /**
     * Outside humditity's daily, monthly and yearly highs and lows
     */
    public humOut = new ElementHighsAndLows();

    /**
     * Outside temperature's daily, monthly and yearly highs and lows
     */
    public tempOut = new ElementHighsAndLows();

    /**
     * Dew point's daily, monthly and yearly highs and lows
     */
    public dew = new ElementHighsAndLows();

    /**
     * Wind chill's daily, monthly and yearly lows
     */
    public chill = new ElementLows();

    /**
     * Heat index's daily, monthly and yearly highs
     */
    public heat = new ElementHighs();

    /**
     * THSW's daily, monthly and yearly highs
     */
    public thsw = new ElementHighs();

    /**
     * Solar radiation's daily, monthly and yearly highs
     */
    public solarRadiation = new ElementHighs();

    /**
     * UV index's daily, monthly and yearly highs
     */
    public uv = new ElementHighs();

    /**
     * Rain rate's hourly, daily, monthly and yearly highs
     */
    public rainRate = new RainRateHighs();

    /**
     * Daily, monthly and yearly highs and lows for the extra temperature sensors (up to 7)
     */
    public extraTemps: [
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows
    ] = [
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
    ];

    /**
     * Daily, monthly and yearly highs and lows for the soil temperature sensors (up to 4)
     */
    public soilTemps: [
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows
    ] = [
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
    ];

    /**
     * Daily, monthly and yearly highs and lows for the leaf temperature sensors (up to 4)
     */
    public leafTemps: [
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows
    ] = [
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
    ];

    /**
     * Daily, monthly and yearly highs and lows for the extra humidity sensors (up to 7)
     */
    public extraHums: [
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows
    ] = [
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
    ];

    /**
     * Daily, monthly and yearly highs and lows for the soil moisture sensors (up to 4)
     */
    public soilMoistures: [
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows
    ] = [
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
    ];

    /**
     * Daily, monthly and yearly highs and lows for the leaf wetness sensors (up to 4)
     */
    public leafWetnesses: [
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows,
        ElementHighsAndLows
    ] = [
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
        new ElementHighsAndLows(),
    ];
}
