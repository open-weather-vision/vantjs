import { TypedEmitter } from "tiny-typed-emitter";
import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";
import { VantPro2Interface, VantVueInterface } from "..";
import createNullRichRealtimeRecord from "../structures/createNullRichRealtimeRecord";
import { RichRealtimeRecord } from "../structures/RichRealtimeRecord";

export type RichRealtimeDataContainerSettings = {
    device: {
        path: string;
        baudRate: number;
        model: DeviceModel.VantageVue | DeviceModel.VantagePro2;
    };
    updateInterval: number;
};

export enum DeviceModel {
    VantageVue,
    VantagePro2,
    VantagePro,
}

interface RichRealtimeDataContainerEvents {
    open: () => void;
    close: () => void;
    update: (err?: any) => void;
}

export default class RichRealtimeDataContainer
    extends TypedEmitter<RichRealtimeDataContainerEvents>
    implements RichRealtimeRecord
{
    public settings: RichRealtimeDataContainerSettings = {
        device: {
            path: "COM1",
            baudRate: 19200,
            model: DeviceModel.VantagePro2,
        },
        updateInterval: 60,
    };

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

    private currentDevice: VantPro2Interface | VantVueInterface | null = null;
    private currentSettings: RichRealtimeDataContainerSettings | null = null;
    private currentUpdateInterval: NodeJS.Timeout | null = null;
    private currentReconnectTimeout: NodeJS.Timeout | null = null;

    constructor(settings: Partial<RichRealtimeDataContainerSettings>) {
        super();
        this.settings = merge(this.settings, settings);
    }

    public close = () => {
        return new Promise<void>((resolve) => {
            if (this.currentUpdateInterval) {
                clearInterval(this.currentUpdateInterval);
            }
            this.currentUpdateInterval = null;

            if (this.currentReconnectTimeout) {
                clearTimeout(this.currentReconnectTimeout);
            }
            this.currentReconnectTimeout = null;

            if (this.currentDevice) {
                this.currentDevice.close().then(() => {
                    this.currentDevice = null;
                    this.emit("close");
                    resolve();
                });
            } else {
                this.currentDevice = null;
                resolve();
            }
        });
    };

    public open = () => {
        return new Promise<void>((resolve) => {
            this.close().then(() => {
                const currentSettings = cloneDeep(this.settings);
                this.setupInterface(cloneDeep(currentSettings));

                const currentDevice = this.currentDevice as
                    | VantPro2Interface
                    | VantVueInterface;

                this.setupUpdateCycle(currentDevice, currentSettings);

                currentDevice.once("open", () => {
                    this.emit("open");
                    resolve();
                });
            });
        });
    };

    public firstUpdate = () => {
        return new Promise<void>((resolve) => {
            this.close().then(() => {
                const currentSettings = cloneDeep(this.settings);
                this.setupInterface(cloneDeep(currentSettings));

                const currentDevice = this.currentDevice as
                    | VantPro2Interface
                    | VantVueInterface;

                this.setupUpdateCycle(currentDevice, currentSettings);

                this.once("update", () => {
                    resolve();
                });
            });
        });
    };

    private setupInterface = (
        currentSettings: RichRealtimeDataContainerSettings
    ) => {
        const { path, model, baudRate } = currentSettings.device;

        switch (model) {
            case DeviceModel.VantagePro2:
                this.currentDevice = new VantPro2Interface({ path, baudRate });
                break;
            case DeviceModel.VantageVue:
                this.currentDevice = new VantVueInterface({
                    path,
                    baudRate,
                });
                break;
        }
    };

    private setupUpdateCycle = (
        device: VantPro2Interface | VantVueInterface,
        currentSettings: RichRealtimeDataContainerSettings
    ) => {
        const update = async () => {
            try {
                await device.open();
                await device.wakeUp();
                const richRealtimeRecord = await device.getRichRealtimeRecord();
                if (richRealtimeRecord) {
                    merge(this, richRealtimeRecord);
                }
                this.emit("update");
            } catch (err) {
                merge(this, createNullRichRealtimeRecord());
                this.emit("update", err);
            }
        };

        this.currentUpdateInterval = setInterval(
            update,
            currentSettings.updateInterval * 1000
        );
    };
}
