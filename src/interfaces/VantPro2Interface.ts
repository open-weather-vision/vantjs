import VantInterface from "./VantInterface";

import { LOOP1, LOOP2, RichRealtimeData } from "vant-environment/structures";
import {
    UnsupportedDeviceModelError,
    MalformedDataError,
    VantError,
    ClosedConnectionError,
    SerialPortError,
} from "../errors";
import { MinimumVantInterfaceSettings } from "./settings";
import { parseLOOP1, parseLOOP2 } from "../parsers";
import flatMerge from "../util/flatMerge";

/**
 * Interface to the _Vantage Pro 2_ weather station. Is built on top of the {@link VantInterface}.
 *
 * Offers station dependent features like {@link VantPro2Interface.getRichRealtimeData}, {@link VantPro2Interface.getLOOP1}, {@link VantPro2Interface.getLOOP2}, {@link VantPro2Interface.isSupportingLOOP2Packages} and {@link VantPro2Interface.getFirmwareVersion}.
 */
export default class VantPro2Interface extends VantInterface {
    /**
     * Creates an interface to your vantage pro 2 weather station using the passed settings. The device should be connected
     * serially.
     *
     * @example
     * ```typescript
     * const device = await VantPro2Interface.connect({ path: "COM3", rainCollectorSize: "0.2mm" });
     *
     * const [richRealtimeData, err] = await device.getRichRealtimeData();
     * inspect(richRealtimeData);
     *
     * await device.disconnect();
     * ```
     * @param settings the settings
     *
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     * @throws {@link FailedToWakeUpError} if the console doesn't wake up after trying three times
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is closed while connecting
     */
    public static async connect(settings: MinimumVantInterfaceSettings) {
        const device = new VantPro2Interface(settings);

        await device.openSerialPort();
        await device.wakeUp(true);

        return device;
    }

    /**
     * Checks whether the connected weather station is supporting {@link LOOP2} packages. This is done using the firmware's date code.
     * @returns whether the connected weather station is supporting {@link LOOP2} packages
     *
     * @throws {@link ClosedConnectionError} if the connection to the weather station's console is already closed
     * @throws {@link MalformedDataError} if the data received from the console is malformed
     * @throws {@link SerialPortError} if the serialport connection unexpectedly closes (or similar)
     */
    public async isSupportingLOOP2Packages(): Promise<
        [boolean | null, VantError | undefined]
    > {
        const [firmwareDateCode, err] = await this.getFirmwareDateCode();
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
    public async getFirmwareVersion(): Promise<
        [string, undefined] | [null, VantError]
    > {
        try {
            this.checkPortConnection();
        } catch (err: any) {
            return [null, err];
        }
        try {
            const data = await this.writeAndWaitForBuffer("NVER\n", 12);
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
    public getLOOP1 = async (): Promise<[LOOP1, VantError | undefined]> => {
        const result = new LOOP1();
        try {
            this.checkPortConnection();
        } catch (err: any) {
            return [result, err];
        }

        try {
            const data = await this.writeAndWaitForBuffer("LPS 1 1\n", 100);

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
    public async getLOOP2(): Promise<[LOOP2, VantError | undefined]> {
        const result = new LOOP2();
        try {
            this.checkPortConnection();
        } catch (err: any) {
            return [result, err];
        }

        try {
            const data = await this.writeAndWaitForBuffer("LPS 2 1\n", 100);

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
    public async getRichRealtimeData(): Promise<
        [RichRealtimeData, VantError | undefined]
    > {
        const result: RichRealtimeData = new RichRealtimeData();
        try {
            this.checkPortConnection();
        } catch (err: any) {
            return [result, err];
        }

        const [loop1, err1] = await this.getLOOP1();
        if (err1) return [result, err1];

        const [loop2, err2] = await this.getLOOP2();
        if (err2) return [result, err2];

        flatMerge(result, loop1);
        flatMerge(result, loop2);

        return [result, undefined];
    }
}
