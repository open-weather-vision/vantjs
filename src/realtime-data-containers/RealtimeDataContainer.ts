import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";
import { TypedEmitter } from "tiny-typed-emitter";

import {
    VantInterface,
    VantPro2Interface,
    VantVueInterface,
    VantProInterface,
} from "../interfaces";
import { defaultUnitSettings } from "../units/defaultUnitSettings";
import {
    RealtimeDataContainerSettings,
    MinimumRealtimeDataContainerSettings,
    DeviceModel,
} from "./settings";
import { RealtimeDataContainerEvents } from "./events";
import { OnContainerCreate } from "./settings/OnContainerCreate";
import { OnInterfaceCreate } from "../interfaces/settings";

/**
 * Base class for the {@link SmallRealtimeDataContainer} and the {@link BigRealtimeDataContainer}.
 */
export default abstract class RealtimeDataContainer<
    Interface extends VantInterface,
    SupportedDeviceModels extends DeviceModel
> extends TypedEmitter<RealtimeDataContainerEvents> {
    /**
     * The default realtime data container settings.
     */
    private static defaultSettings = {
        baudRate: 19200,
        updateInterval: 60,
        onCreate: OnContainerCreate.WaitForFirstValidUpdate,
        units: defaultUnitSettings,
    };

    /**
     * The realtime data container's settings. Immutable.
     */
    public readonly settings: RealtimeDataContainerSettings<SupportedDeviceModels>;

    /**
     * The currently internally used interface
     */
    protected currentDevice: Interface | null = null;

    /**
     * The currently active update interval
     */
    private currentUpdateInterval: NodeJS.Timeout | null = null;

    public get isPortOpen() {
        if (!this.currentDevice) {
            return false;
        }
        return this.currentDevice.isPortOpen;
    }

    /**
     * Creates a new instance and merges the passed settings with the default settings.
     * @param settings the realtime data container's settings
     */
    protected constructor(
        settings: MinimumRealtimeDataContainerSettings<SupportedDeviceModels>
    ) {
        super();
        this.settings = merge(
            cloneDeep(RealtimeDataContainer.defaultSettings),
            settings
        );
    }

    /**
     * Performs the {@link OnContainerCreate onCreate} action on the passed container.
     * @param container
     * @returns the container
     */
    protected static async performOnCreateAction<
        W extends RealtimeDataContainer<any, any>
    >(container: W): Promise<W> {
        switch (container.settings.onCreate) {
            case OnContainerCreate.DoNothing:
                break;
            case OnContainerCreate.Start:
                await container.start();
                break;
            case OnContainerCreate.StartAndWaitUntilOpen:
                await container.startAndWaitUntilOpen();
                break;
            case OnContainerCreate.WaitForFirstUpdate:
                container.start();
                await container.waitForUpdate();
                break;
            case OnContainerCreate.WaitForFirstValidUpdate:
                container.start();
                await container.waitForValidUpdate();
                break;
        }
        return container;
    }

    /**
     * Stops the realtime data container. The update cycle is stopped and the connection to the
     * weather station gets closed.
     */
    public stop = () => {
        return new Promise<void>((resolve) => {
            if (this.currentUpdateInterval) {
                clearInterval(this.currentUpdateInterval);
            }
            this.currentUpdateInterval = null;

            if (this.currentDevice) {
                this.currentDevice.close().then(() => {
                    this.currentDevice = null;
                    this.emit("stop");
                    resolve();
                });
            } else {
                this.currentDevice = null;
                resolve();
            }
        });
    };

    /**
     * Starts the realtime data container. Doesn't wait for the serial port connection to be opened.
     *
     * If the container got already started it is stopped first.
     *
     * Starts the update cycle and tries to connect to the weather station console. If connecting fails,
     * the realtime data container tries to reconnect every `settings.updateInterval` seconds.
     */
    public start = () => {
        return new Promise<void>((resolve) => {
            this.stop().then(async () => {
                await this.setupInterface();

                const currentDevice = this.currentDevice as Interface;
                this.startUpdateCycle(currentDevice);

                currentDevice.on("open", () => {
                    this.emit("device-open");
                });

                currentDevice.on("close", () => {
                    this.emit("device-close");
                });

                currentDevice.open();

                this.emit("start");
                resolve();
            });
        });
    };

    /**
     * Starts the realtime data container and waits for the serial port connection to be opened.
     *
     * If the container got already started it is stopped first.
     *
     * Starts the update cycle and tries to connect to the weather station console. If connecting fails,
     * the realtime data container tries to reconnect every `settings.updateInterval` seconds.
     */
    public startAndWaitUntilOpen = () => {
        return new Promise<void>((resolve) => {
            this.stop().then(async () => {
                await this.setupInterface();

                const currentDevice = this.currentDevice as Interface;
                this.startUpdateCycle(currentDevice);

                currentDevice.on("open", () => {
                    this.emit("device-open");
                });

                currentDevice.on("close", () => {
                    this.emit("device-close");
                });

                await currentDevice.open();

                this.emit("start");
                resolve();
            });
        });
    };

    /**
     * Waits for the next update on the realtime data container. If an error occurrs while updating
     * an error object is returned. This can be used to handle errors. See {@link RealtimeDataContainerEvents}.
     *
     * @example
     * ```ts
     * const err = await container.waitForUpdate();
     * if(err){
     *   // handle error
     * }else{
     *   // ...
     * }
     * ```
     */
    public waitForUpdate = () => {
        return new Promise<void | any>((resolve) => {
            this.once("update", (err) => {
                resolve(err);
            });
        });
    };

    /**
     * Waits for the next valid update on the realtime data container. See {@link RealtimeDataContainerEvents}.
     */
    public waitForValidUpdate = () => {
        return new Promise<void>((resolve) => {
            this.once("valid-update", async () => {
                resolve();
            });
        });
    };

    /**
     * Creates the internally used interface (dependent on the passed device model) and opens the connection to the weather station console.
     */
    private setupInterface = async () => {
        const { path, model, baudRate, rainCollectorSize, units } =
            this.settings;
        switch (model) {
            case DeviceModel.VantagePro2:
                this.currentDevice = (await VantPro2Interface.create({
                    path,
                    baudRate,
                    rainCollectorSize,
                    units,
                    onCreate: OnInterfaceCreate.DoNothing,
                })) as any;
                break;
            case DeviceModel.VantageVue:
                this.currentDevice = (await VantVueInterface.create({
                    path,
                    baudRate,
                    rainCollectorSize,
                    units,
                    onCreate: OnInterfaceCreate.DoNothing,
                })) as any;
                break;
            case DeviceModel.VantagePro:
                this.currentDevice = (await VantProInterface.create({
                    path,
                    baudRate,
                    rainCollectorSize,
                    units,
                    onCreate: OnInterfaceCreate.DoNothing,
                })) as any;
                break;
        }
    };

    /**
     * Starts the update cycle (using the passed interface).
     * @param device the interface to the device
     */
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

                try {
                    await this.onUpdate(device);
                } catch (err) {
                    await this.onConnectionError();
                    throw err;
                }

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

    /**
     * Gets called if an error occurrs while updating the weather data.
     */
    protected abstract onConnectionError(): Promise<void>;

    /**
     * In this method an extending class should specify the update process of the realtime data container.
     */
    protected abstract onUpdate(device: Interface): Promise<void>;
}
