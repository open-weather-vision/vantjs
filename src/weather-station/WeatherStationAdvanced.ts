import { LOOP1, LOOP2, DetailedRealtimeData } from "vant-environment/structures";
import {
    UnsupportedDeviceModelError,
    MalformedDataError,
    VantError,
    ClosedConnectionError,
    SerialPortError,
} from "../errors";
import { MinimumWeatherStationSettings } from "./settings";
import { parseLOOP1, parseLOOP2 } from "../parsers";
import flatMerge from "../util/flatMerge";
import WeatherStation from "./WeatherStation";

/**
 * More feature rich interface to any _Vantage Pro 2_ or _Vantage Vue_ weather station with firmware dated after April 24, 2002 (v1.90 or above).
 * Is built on top of the {@link VantageWeatherStation}.
 *
 * Offers station dependent features like {@link VantageWeatherStationAdvanced.getDetailedRealtimeData}, {@link VantageWeatherStationAdvanced.getLOOP1}, {@link VantageWeatherStationAdvanced.getLOOP2}, {@link VantageWeatherStationAdvanced.isSupportingLOOP2Packages} and {@link VantageWeatherStationAdvanced.getFirmwareVersion}.
 */
export default class WeatherStationAdvanced extends WeatherStation {
    /**
     * Creates an interface to your vantage pro 2 weather station using the passed settings. The device should be connected
     * serially.
     *
     * @example
     * ```typescript
     * const device = await VantProInterface.connect({ path: "COM3", rainCollectorSize: "0.2mm" });
     *
     *
     * const [data, err] = await device.getSimpleRealtimeData();
     * console.log(`It's ${data.tempOut}°F outside!`);
     *
     * await device.disconnect();
     * ```
     * @param settings the settings
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link FailedToWakeUpError} if the interface failed to wake up the console
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public static async connect(settings: MinimumWeatherStationSettings) {
        const device = new WeatherStationAdvanced(settings);

        await device.port.open();
        await device.wakeUp();

        return device;
    }

    /**
     * Checks whether the connected weather station is supporting {@link LOOP2} packages. This is done using the firmware's date code.
     * @returns whether the connected weather station is supporting {@link LOOP2} packages
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public async isSupportingLOOP2Packages(timeout?: number): Promise<
        [boolean | null, VantError | undefined]
    > {
        const [firmwareDateCode, err] = await this.getFirmwareDateCode(timeout);
        if (err) {
            return [null, err];
        }
        return [
            Date.parse(firmwareDateCode) > Date.parse("Apr 24 2002"),
            undefined,
        ];
    }

    /**
     * Gets the console's firmware version in the `"vX.XX"` format (e.g. `"v3.80"`).
     * @returns the console's firmware version
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public async getFirmwareVersion(timeout?: number): Promise<
        [string, undefined] | [null, VantError]
    > {
        try {
            await this.checkConsoleConnection(timeout);
        } catch (err: any) {
            return [null, err];
        }
        try {
            const data = await this.writeAndWaitForBuffer("NVER\n", 12, timeout);
            const firmwareVersion = data
                .toString("ascii")
                .split("OK")[1]
                .trim();
            return [`v${firmwareVersion}`, undefined];
        } catch (err) {
            return [null, new MalformedDataError()];
        }
    }

    /**
     * Gets the {@link LOOP1} package.
     * @returns the {@link LOOP1} package
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public getLOOP1 = async (timeout?: number): Promise<[LOOP1, VantError | undefined]> => {
        const result = new LOOP1();
        try {
            await this.checkConsoleConnection(timeout);
        } catch (err: any) {
            return [result, err];
        }

        try {
            const data = await this.writeAndWaitForBuffer("LPS 1 1\n", 100, timeout);

            // Check ack
            this.validateAcknowledgementByte(data);

            const packageType = data.readUInt8(5);
            if (packageType === 0) {
                const splitData = this.splitCRCAckDataPackage(data);

                // Check data (crc check)
                this.validateCRC(splitData.data, splitData.crc);

                return [
                    parseLOOP1(
                        splitData.data,
                        this.rainClicksToInchTransformer,
                        this.unitTransformers
                    ),
                    undefined,
                ];
            } else {
                return [
                    result,
                    new UnsupportedDeviceModelError(
                        "This weather station doesn't support explicitly querying LOOP1 packages. Try getDefaultLOOP()."
                    ),
                ];
            }
        } catch (err: any) {
            return [result, err];
        }
    };

    /**
     * Gets the {@link LOOP2} package. Requires firmware dated after April 24, 2002 (v1.90 or above).
     * To check if your weather station supports the {@link LOOP2} package call {@link isSupportingLOOP2Packages}.
     * @returns the {@link LOOP2} package
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public async getLOOP2(timeout?: number): Promise<[LOOP2, VantError | undefined]> {
        const result = new LOOP2();
        try {
            await this.checkConsoleConnection(timeout);
        } catch (err: any) {
            return [result, err];
        }

        try {
            const data = await this.writeAndWaitForBuffer("LPS 2 1\n", 100, timeout);

            // Check ack
            this.validateAcknowledgementByte(data);

            const packageType = data.readUInt8(5);
            if (packageType !== 0) {
                const splitData = this.splitCRCAckDataPackage(data);

                // Check data (crc check)
                this.validateCRC(splitData.data, splitData.crc);

                return [
                    parseLOOP2(
                        splitData.data,
                        this.rainClicksToInchTransformer,
                        this.unitTransformers
                    ),
                    undefined,
                ];
            } else {
                return [
                    result,
                    new UnsupportedDeviceModelError(
                        "This weather station doesn't support LOOP2 packages. Try getLOOP() or getDefaultLOOP()."
                    ),
                ];
            }
        } catch (err: any) {
            return [result, err];
        }
    }

    /**
     * Gets detailed weather information from all sensors (internally combining {@link LOOP1} and {@link LOOP2} packages).
     * Only works if your weather station supports {@link LOOP2} packages. This can be checked by calling {@link isSupportingLOOP2Packages}.
     * @returns detailed weather information
     *
     * @link _Following errors are possible_:
     * - {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * - {@link MalformedDataError} if the data received from the console is malformed
     * - {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public async getDetailedRealtimeData(timeout?: number): Promise<
        [DetailedRealtimeData, VantError | undefined]
    > {
        const result: DetailedRealtimeData = new DetailedRealtimeData();

        const [loop1, err1] = await this.getLOOP1(timeout);
        if (err1) return [result, err1];

        const [loop2, err2] = await this.getLOOP2(timeout);
        if (err2) return [result, err2];

        flatMerge(result, loop1);
        flatMerge(result, loop2);

        return [result, undefined];
    }
}
