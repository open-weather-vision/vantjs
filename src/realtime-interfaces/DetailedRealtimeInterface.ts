import merge from "lodash.merge";
import WeatherStationAdvanced from "../weather-station/WeatherStationAdvanced";
import { HighsAndLows, DetailedRealtimeData } from "vant-environment/structures";
import RealtimeInterface from "./RealtimeInterface";
import { MinimumRealtimeInterfaceSettings } from "./settings/MinimumRealtimeInterfaceSettings";

/**
 * The more feature rich version of the realtime interface providing {@link HighsAndLows} and {@link RichRealtimeData}.
 * Only works on Vantage Pro 2 and Vue (having firmware dated after April 24, 2002 / v1.90 or above).
 *
 * **What are realtime interfaces?**
 *
 * Realtime interfaces provide another level of abstraction to interact with your weather station. Instead of manually calling methods like
 * {@link WeatherStationAdvanced.getHighsAndLows} or {@link WeatherStationAdvanced.getDetailedRealtimeData}, you just access the attributes of an instance of this class.
 * E.g. to get the current outside temperature you just create a realtime interface and access it using `realtime.tempOut`.
 *
 * Internally this works via an update cycle. Every `container.settings.updateInterval` seconds the interface requests data from your weather station to update its attributes.
 * As the realtime interface is an [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter), you can listen to the `"update"` event. Additionally
 * there is the `"valid-update"` event which only fires if no error occurrs.
 */
export default class DetailedRealtimeInterface
    extends RealtimeInterface<WeatherStationAdvanced>
    implements DetailedRealtimeData
{
    /**
     * Holds daily, monthly and yearly highs and lows for all weather elements / sensors.
     */
    public highsAndLows = new HighsAndLows();

    /**
     * Current pressure
     */
    public press: number | null = null;

    /**
     * The pressure's trend. There are five possible trends:
     *  - Falling Rapidly
     *  - Falling Slowly
     *  - Steady
     *  - Rising Slowly
     *  - Rising Rapidly
     */
    public pressTrend:
        | "Falling Rapidly"
        | "Steady"
        | "Rising Rapidly"
        | "Rising Slowly"
        | "Falling Slowly"
        | null = null;

    /**
     * The pressure's trend encoded as number.
     *  - `-60` stands for *Falling Rapidly*
     *  - `-20` stands for *Falling Slowly*
     *  - `0` stands for *Steady*
     *  - `20` stands for *Rising Slowly*
     *  - `60` stands for *Rising Rapidly*
     */
    public pressTrendID: -60 | -20 | 0 | 20 | 60 | null = null;

    /** Current outside temperature */
    public tempOut: number | null = null;

    /** Current inside temperature (the console's temperature) */
    public tempIn: number | null = null;

    /**
     * Current inside humidity in percent
     */
    public humIn: number | null = null;

    /**
     * Current outside humidity in percent
     */
    public humOut: number | null = null;

    /**
     * Currently measured wind speed
     */
    public wind: number | null = null;

    /**
     * Average wind speed in the recent ten minutes
     */
    public windAvg10m: number | null = null;

    /**
     * Currently measured wind direction encoded as string. Possible values are:
     * - NNE
     * - NE
     * - ENE
     * - E
     * - ESE
     * - SE
     * - SSE
     * - S
     * - SSW
     * - SW
     * - WSW
     * - W
     * - WNW
     * - NW
     * - NNW
     * - N
     */
    public windDir:
        | "NNE"
        | "NE"
        | "ENE"
        | "E"
        | "ESE"
        | "SE"
        | "SSE"
        | "S"
        | "SSW"
        | "SW"
        | "WSW"
        | "W"
        | "WNW"
        | "NW"
        | "NNW"
        | "N"
        | null
        | null = null;

    /**
     * The wind speed direction in degrees (from `1` to `360`).
     * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
     */
    public windDirDeg: number | null = null;

    /**
     * The current rain rate
     */
    public rainRate: number | null = null;

    /**
     * The amount of rain that fell today
     */
    public rainDay: number | null = null;

    /**
     * The most recent rainstorm's amount of rain
     */
    public stormRain: number | null = null;

    /**
     * The most recent rainstorm's start date (without time)
     */
    public stormStartDate: Date | null = null;

    /**
     * Measured evapotranspiration (ET) of the day
     */
    public etDay: number | null = null;

    /**
     * Currently measured UV index
     */
    public uv: number | null = null;

    /**
     * Currently measured solar radiation
     */
    public solarRadiation: number | null = null;

    /**
     * Measured extra temperatures (from up to 7 sensors)
     */
    public tempExtra: [
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null, null, null, null];

    /**
     * Measured leaf temperatures (from up to 4 sensors)
     */
    public leafTemps: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Measured soil temperatures (from up to 4 sensors)
     */
    public soilTemps: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Measured extra humidities (from up to 7 sensors)
     */
    public humExtra: [
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null, null, null, null];

    /**
     * The amount of rain that has fallen in this month
     */
    public rainMonth: number | null = null;

    /**
     * The amount of rain that has fallen in this year
     */
    public rainYear: number | null = null;

    /**
     * Measured evapotranspiration (ET) in the current month
     */
    public etMonth: number | null = null;

    /**
     * Measured evapotranspiration (ET) in the current year
     */
    public etYear: number | null = null;

    /**
     * Measured soil moisture from up to 4 sensors
     */
    public soilMoistures: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Measured leaf wetness from up to 4 sensors
     */
    public leafWetnesses: [
        number | null,
        number | null,
        number | null,
        number | null
    ] = [null, null, null, null];

    /**
     * Current forecast computed by the connected vantage console
     *
     * There are the following options:
     * - Sun
     * - Partly Cloudy
     * - Mostly Cloudy
     * - Mostly Cloudy, Rain within 12 hours
     * - Mostly Cloudy, Snow within 12 hours
     * - Partly Cloudy, Rain or Snow within 12 hours
     * - Partly Cloudy, Rain within 12 hours
     * - Partly Cloudy, Snow within 12 hours
     * - Partly Cloudy, Rain or Snow within 12 hours
     */
    public forecast:
        | "Mostly Clear"
        | "Partly Cloudy"
        | "Mostly Cloudy"
        | "Mostly Cloudy, Rain within 12 hours"
        | "Mostly Cloudy, Snow within 12 hours"
        | "Mostly Cloudy, Rain or Snow within 12 hours"
        | "Partly Cloudy, Rain within 12 hours"
        | "Partly Cloudy, Rain or Snow within 12 hours"
        | "Partly Cloudy, Snow within 12 hours"
        | null = null;

    /**
     * The calculated forecast encoded as number:
     * - `8` => Mostly Clear
     * - `6` => Partly Cloudy
     * - `2` => Mostly Cloudy
     * - `3` => Mostly Cloudy, Rain within 12 hours
     * - `18` => Mostly Cloudy, Snow within 12 hours
     * - `19` => Partly Cloudy, Rain or Snow within 12 hours
     * - `7` => Partly Cloudy, Rain within 12 hours
     * - `22` => Partly Cloudy, Snow within 12 hours
     * - `23` => Partly Cloudy, Rain or Snow within 12 hours
     */
    public forecastID: 7 | 8 | 6 | 2 | 3 | 18 | 19 | 22 | 23 | null = null;

    /**
     * Not documented. Please create an issue on github if you know more about this.
     */
    public forecastRule: number | null = null;

    /**
     * The transmitter's battery status (poorly documented)
     */
    public transmitterBatteryStatus: number | null = null;

    /**
     * The console's battery voltage
     */
    public consoleBatteryVoltage: number | null = null;

    /**
     * The today's sunrise time (e.g. `"06:35"`)
     */
    public sunrise: Date | null = null;

    /**
     * The today's sunset time (e.g. `"19:35"`)
     */
    public sunset: Date | null = null;

    /** Barometric sensor raw reading */
    public pressRaw: number | null = null;

    /** Absolute barometric pressure. Equals to the raw sensor ({@link pressRaw}) reading plus user entered offset ({@link pressUserOffset}). */
    public pressAbs: number | null = null;

    /**
     * The used barometric reduction method to calculate the ground pressure.
     * There are three different settings:
     *  - user offset
     *  - altimeter setting
     *  - NOAA bar reduction
     */
    public pressReductionMethod:
        | "user offset"
        | "altimeter setting"
        | "NOAA bar reduction"
        | null = null;

    /**
     * The used barometric reduction method encoded as number.
     * `0` is user offset, `1` is altimeter setting and `2` is NOAA bar reduction.
     */
    public pressReductionMethodID: 0 | 1 | 2 | null = null;

    /**
     * The user-entered barometric offset
     */
    public pressUserOffset: number | null = null;

    /**
     * The barometer calibration number
     */
    public pressCalibrationOffset: number | null = null;

    /**
     * The altimeter setting
     */
    public altimeter: number | null = null;

    /**
     * The measured heat index
     */
    public heat: number | null = null;

    /**
     * The calculated dew point
     */
    public dew: number | null = null;
    /**
     * Average wind speed in the recent two minutes
     */
    public windAvg2m: number | null = null;

    /**
     * Speed of the heaviest gust in the recent 10 minutes
     */
    public windGust: number | null = null;

    /**
     * The heaviest wind gust's ({@link windGust}) direction encoded as string. Possible values are:
     * - NNE
     * - NE
     * - ENE
     * - E
     * - ESE
     * - SE
     * - SSE
     * - S
     * - SSW
     * - SW
     * - WSW
     * - W
     * - WNW
     * - NW
     * - NNW
     * - N
     */
    public windGustDir:
        | "NNE"
        | "NE"
        | "ENE"
        | "E"
        | "ESE"
        | "SE"
        | "SSE"
        | "S"
        | "SSW"
        | "SW"
        | "WSW"
        | "W"
        | "WNW"
        | "NW"
        | "NNW"
        | "N"
        | null
        | null = null;

    /**
     * The heaviest wind gust's ({@link windGust}) direction in degrees (from `1` to `360`).
     * `90°` is East, `180°` is South, `270°`is West and `360°` is North.
     */
    public windGustDirDeg: number | null = null;

    /**
     * The current wind chill
     */
    public chill: number | null = null;

    /**
     * The currently measured THSW index. Requires a solar radiation sensor.
     */
    public thsw: number | null = null;

    /**
     * The amount of rain that has fallen in the recent 15 minutes
     */
    public rain15m: number | null = null;

    /**
     * The amount of rain that has fallen in the recent hour
     */
    public rain1h: number | null = null;

    /**
     * The amount of rain that has fallen in the recent 24 hours
     */
    public rain24h: number | null = null;

    /**
     * The time the record was created
     */
    public time: Date = new Date();

    /**
     * Connects the realtime data container with your weather station.
     * After that you need to start the realtime data container!
     * 
     * @example
     * ```ts
     * const realtime = await DetailedRealtimeInterface.connect({...});
     * realtime.start();
     * await realtime.waitForUpdate();
     * 
     * console.log(`It's ${realtime.tempOut}°F outside!`);
     * realtime.stop();
     * ```
     * @param settings your desired settings
     * @returns the connected realtime data container
     * 
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console closes suddenly
     * - {@link FailedToWakeUpError} if the interface failed to wake up the console
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public static connect = async (settings: MinimumRealtimeInterfaceSettings) => {
        const device = await WeatherStationAdvanced.connect(settings);
        return new DetailedRealtimeInterface(settings, device);
    }

    /**
     * Creates a new instance of the big realtime container and sets the settings. Doesn't perform the {@link OnContainerCreate} action.
     * @param settings
     */
    private constructor(
        settings: MinimumRealtimeInterfaceSettings,
        device: WeatherStationAdvanced
    ) {
        super(settings, device, false);
    }

    /**
     * Sets all sensor values to `null`.
     */
    protected onConnectionError = async () => {
        merge(this, new DetailedRealtimeData());
        this.highsAndLows = new HighsAndLows();
    };

    /**
     * Updates the big realtime interface. Merges a new RichRealtimeData instance
     * into this and updates the highs and lows.
     * @param device
     */
    protected updateData = async () => {
        const [realtimeData, err1] = await this.device.getDetailedRealtimeData();
        merge(this, realtimeData);

        const [highsAndLows, err2] = await this.device.getHighsAndLows();
        this.highsAndLows = highsAndLows;

        if(err1) throw err1;
        if(err2) throw err2;
    };
}