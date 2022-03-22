import { TypedEmitter } from "tiny-typed-emitter";
import { DeviceModel } from "./DeviceModel";
import VantInterface from "../interfaces/VantInterface";
import VantPro2Interface from "../interfaces/VantPro2Interface";
import VantVueInterface from "../interfaces/VantVueInterface";
import VantProInterface from "../interfaces/VantProInterface";
import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";

export enum OnCreate {
    DoNothing = 0,
    WaitUntilOpen = 1,
    WaitForFirstUpdate = 2,
    WaitForFirstValidUpdate = 3,
}

export interface WeatherDataContainerSettings<
    SupportedDeviceModels extends DeviceModel
> {
    readonly device: {
        readonly path: string;
        readonly baudRate: number;
        readonly model: SupportedDeviceModels;
    };
    readonly updateInterval: number;
    readonly onCreate: OnCreate;
}

export type MinimumWeatherDataContainerSettings<
    SupportedDeviceModels extends DeviceModel
> = {
    readonly device: {
        readonly path: string;
        readonly baudRate?: number;
        readonly model: SupportedDeviceModels;
    };
    readonly updateInterval?: number;
    readonly onCreate?: OnCreate;
};

interface WeatherDataContainerEvents {
    open: () => void;
    close: () => void;
    update: (err?: any | undefined) => void;
    "valid-update": () => void;
}

export default abstract class WeatherDataContainer<
    Interface extends VantInterface,
    SupportedDeviceModels extends DeviceModel
> extends TypedEmitter<WeatherDataContainerEvents> {
    private static defaultSettings = {
        device: {
            baudRate: 19200,
        },
        updateInterval: 60,
        onCreate: OnCreate.WaitForFirstUpdate,
    };

    public settings: WeatherDataContainerSettings<SupportedDeviceModels>;

    protected currentDevice: Interface | null = null;
    private currentUpdateInterval: NodeJS.Timeout | null = null;
    private currentReconnectTimeout: NodeJS.Timeout | null = null;

    protected constructor(
        settings: MinimumWeatherDataContainerSettings<SupportedDeviceModels>
    ) {
        super();
        this.settings = merge(
            cloneDeep(WeatherDataContainer.defaultSettings),
            settings
        );
    }

    protected static async initialize<W extends WeatherDataContainer<any, any>>(
        container: W
    ): Promise<W> {
        switch (container.settings.onCreate) {
            case OnCreate.DoNothing:
                container.open();
                break;
            case OnCreate.WaitUntilOpen:
                await container.open();
                break;
            case OnCreate.WaitForFirstUpdate:
                container.open();
                await container.waitForUpdate();
                break;
            case OnCreate.WaitForFirstValidUpdate:
                container.open();
                await container.waitForValidUpdate();
                break;
        }
        return container;
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
            this.close().then(async () => {
                await this.setupInterface();

                const currentDevice = this.currentDevice as Interface;
                this.startUpdateCycle(currentDevice);

                currentDevice.once("open", () => {
                    this.emit("open");
                    resolve();
                });
            });
        });
    };

    public waitForUpdate = () => {
        return new Promise<void | any>((resolve) => {
            this.once("update", (err) => {
                resolve(err);
            });
        });
    };

    public waitForValidUpdate = () => {
        return new Promise<void>((resolve) => {
            this.once("valid-update", async () => {
                resolve();
            });
        });
    };

    private setupInterface = async () => {
        const { path, model, baudRate } = this.settings.device;
        switch (model) {
            case DeviceModel.VantagePro2:
                this.currentDevice = (await VantPro2Interface.create({
                    path,
                    baudRate,
                })) as any;
                break;
            case DeviceModel.VantageVue:
                this.currentDevice = (await VantVueInterface.create({
                    path,
                    baudRate,
                })) as any;
                break;
            case DeviceModel.VantagePro:
                this.currentDevice = (await VantProInterface.create({
                    path,
                    baudRate,
                })) as any;
                break;
        }
    };

    private startUpdateCycle = (device: Interface) => {
        const update = async () => {
            try {
                try {
                    await device.open();
                    await device.wakeUp();
                } catch (err) {
                    await this.onConnectionError();
                    throw err;
                }

                await this.onUpdate(device);

                this.emit("update");
                this.emit("valid-update");
            } catch (err) {
                this.emit("update", err);
            }
        };

        update();
        this.currentUpdateInterval = setInterval(
            update,
            this.settings.updateInterval * 1000
        );
    };

    protected abstract onConnectionError(): Promise<void>;
    protected abstract onUpdate(device: Interface): Promise<void>;
}
