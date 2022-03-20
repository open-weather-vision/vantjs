import EventEmitter from "events";
import merge from "lodash.merge";
import { VantPro2Interface, VantVueInterface } from "..";
import DeviceStillConnectedError from "../errors/DeviceStillConnectedError";
import MissingDevicePathError from "../errors/MissingDevicePathError";
import UnsupportedDeviceModelError from "../errors/UnsupportedDeviceModelError";
import { RichRealtimeRecord } from "../structures/RichRealtimeRecord";

export type RichRealtimeDataContainerSettings = {
    device: {
        path: string | null;
        baudRate: number;
        model: DeviceModel;
    };
    updateInterval: number;
};

export enum DeviceModel {
    VantageVue,
    VantagePro2,
    VantagePro,
}

export default class RichRealtimeDataContainer
    extends EventEmitter
    implements RichRealtimeRecord
{
    public settings: RichRealtimeDataContainerSettings;

    public pressure = {
        current: null,
        currentRaw: null,
        currentAbsolute: null,
        trend: {
            value: null,
            text: null,
        },
        reductionMethod: {
            value: null,
            text: null,
        },
        userOffset: null,
        calibrationOffset: null,
    };

    public altimeter = null;

    public heat = null;

    public dewpoint = null;

    public temperature = {
        in: null,
        out: null,
        extra: [null, null, null, null, null, null, null] as [
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null
        ],
    };

    public leafTemps = [null, null, null, null] as [
        number | null,
        number | null,
        number | null,
        number | null
    ];

    public soilTemps = [null, null, null, null] as [
        number | null,
        number | null,
        number | null,
        number | null
    ];

    public humidity = {
        in: null,
        out: null,
        extra: [null, null, null, null, null, null, null] as [
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null,
            number | null
        ],
    };

    public wind = {
        current: null,
        avg: { tenMinutes: null, twoMinutes: null },
        direction: null,
        heaviestGust10min: { direction: null, speed: null },
        chill: null,
        thsw: null,
    };

    public rain = {
        rate: null,
        storm: null,
        stormStartDate: null,
        day: null,
        month: null,
        year: null,
        last15min: null,
        lastHour: null,
        last24h: null,
    };

    public et = {
        day: null,
        month: null,
        year: null,
    };

    public soilMoistures = [null, null, null, null] as [
        number | null,
        number | null,
        number | null,
        number | null
    ];

    public leafWetnesses = [null, null, null, null] as [
        number | null,
        number | null,
        number | null,
        number | null
    ];

    public uv = null;

    public solarRadiation = null;

    public transmitterBatteryStatus = null;

    public consoleBatteryVoltage = null;

    public forecast = {
        iconNumber: null,
        iconText: null,
        rule: null,
    };

    public sunrise = null;

    public sunset = null;

    public time = new Date();

    private currentInterval: NodeJS.Timeout | null = null;
    private currentDevice: VantPro2Interface | VantVueInterface | null = null;

    constructor(settings: RichRealtimeDataContainerSettings) {
        super();
        this.settings = settings;
    }

    private update = async () => {
        const richRealtimeRecord =
            await this.currentDevice?.getRichRealtimeRecord();
        if (richRealtimeRecord) {
            merge(this, richRealtimeRecord);
        }
        this.emit("update");
    };

    public disconnect() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
        }

        if (this.currentDevice) {
            this.currentDevice.close();
        }

        this.emit("disconnected");

        this.currentDevice = null;
        this.currentInterval = null;
    }

    public connect() {
        if (this.currentDevice?.isPortOpen()) {
            throw new DeviceStillConnectedError(
                "The rich realtime data container is still connected to a serial device! Call disconnect() before connecting again."
            );
        }

        if (this.settings.device.path == null) {
            throw new MissingDevicePathError();
        }

        switch (this.settings.device.model) {
            case DeviceModel.VantagePro2:
                this.currentDevice = new VantPro2Interface(
                    this.settings.device.path,
                    this.settings.device.baudRate
                );
                break;
            case DeviceModel.VantageVue:
                this.currentDevice = new VantVueInterface(
                    this.settings.device.path,
                    this.settings.device.baudRate
                );
                break;
            case DeviceModel.VantagePro:
                throw new UnsupportedDeviceModelError(
                    "The BigWeatherContainer only works on the Vantage Pro 2 or the Vantage Vue weather station"
                );

            default:
                throw new UnsupportedDeviceModelError(
                    "You didn't configure the device model (settings.device.model)"
                );
        }

        this.currentDevice.on("error", (err: Error) => {
            this.emit("error", err);
        });

        this.currentDevice.ready(async () => {
            this.emit("connected");
            this.currentInterval = setInterval(
                this.update,
                this.settings.updateInterval * 1000
            );
        }, false);
    }
}
