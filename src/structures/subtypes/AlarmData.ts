import HighLowAlarms from "./HighLowAlarms";
import PressureAlarms from "./PressureAlarms";
import RainAlarms from "./RainAlarms";
import UVAlarms from "./UVAlarms";
import WindAlarms from "./WindAlarms";

export default class AlarmData {
    /**
     * @hidden
     */
    constructor() {}

    /**
     * Pressure alarms
     */
    public pressure = new PressureAlarms();

    /**
     * Inside temperature alarms
     */
    public tempIn = new HighLowAlarms();

    /**
     * Inside humdity alarms
     */
    public humIn = new HighLowAlarms();

    /**
     * Whether the time alarm is active
     */
    public time: boolean | null = null;

    /**
     * Rain (rate) alarms
     */
    public rain = new RainAlarms();

    /**
     * Whether the daily ET alarm is active
     */
    public dailyET: boolean | null = null;

    /**
     * Outside temperature alarms
     */
    public tempOut = new HighLowAlarms();

    /**
     * Wind alarms
     */
    public wind = new WindAlarms();
    /**
     * Dewpoint alarms
     */
    public dewpoint = new HighLowAlarms();

    /**
     * Whether the high heat index alarm is active
     */
    public heat: boolean | null = null;

    /**
     * Whether the low wind chill alarm is active
     */
    public chill: boolean | null = null;

    /**
     * Whether the high THSW index alarm is active
     */
    public thsw: boolean | null = null;

    /**
     * Whether the high solar radiation alarm is active
     */
    public solarRadiation: boolean | null = null;

    /**
     * UV alarms
     */
    public UV = new UVAlarms();

    /**
     * Outside humidity alarms
     */
    public humOut = new HighLowAlarms();

    /**
     * Extra temperature alarms (for up to 7 sensors)
     * `extraTemps[i].low` is `true` when the low extra temperature alarm for sensor `i` is active,
     * `extraTemps[i].high` is `true` when the high extra temperature alarm for sensor `i` is active.
     */
    public extraTemps = [
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
    ] as const;

    /**
     * Extra humdity alarms (for up to 7 sensors)
     * `extraHums[i].low` is `true` when the low extra humidity alarm for sensor `i` is active,
     * `extraHums[i].high` is `true` when the high extra humidity alarm for sensor `i` is active.
     */
    public extraHums = [
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
    ] as const;

    /**
     * Leaf wetness alarms (for up to 4 sensors)
     * `leafWetnesses[i].low` is `true` when the low leaf wetness alarm for sensor `i` is active,
     * `leafWetnesses[i].high` is `true` when the high leaf wetness alarm for sensor `i` is active.
     */
    public leafWetnesses = [
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
    ] as const;

    /**
     * Soil moisture alarms (for up to 4 sensors)
     * `soilMoistures[i].low` is `true` when the low soil moisture alarm for sensor `i` is active,
     * `soilMoistures[i].high` is `true` when the high soil moisture alarm for sensor `i` is active.
     */
    public soilMoistures = [
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
    ] as const;

    /**
     * Leaf temperature alarms (for up to 4 sensors)
     * `leafTemps[i].low` is `true` when the low leaf temperature alarm for sensor `i` is active,
     * `leafTemps[i].high` is `true` when the high leaf temperature alarm for sensor `i` is active.
     */
    public leafTemps = [
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
    ] as const;

    /**
     * Soil temperature alarms (for up to 4 sensors)
     * `soilTemps[i].low` is `true` when the low soil temperature alarm for sensor `i` is active,
     * `soilTemps[i].high` is `true` when the high soil temperature alarm for sensor `i` is active.
     */
    public soilTemps = [
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
    ] as const;
}
