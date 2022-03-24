import merge from "lodash.merge";
import MalformedDataError from "../errors/MalformedDataError";
import LOOP2Parser from "../parsers/LOOP2Parser";
import LOOPParser from "../parsers/LOOPParser";
import { RichRealtimeRecord } from "../structures/RichRealtimeRecord";
import VantInterface, { MinimumVantInterfaceSettings } from "./VantInterface";
import UnsupportedDeviceModelError from "../errors/UnsupportedDeviceModelError";
import createNullRichRealtimeRecord from "../structures/createNullRichRealtimeRecord";

/**
 * Interface to the _Vantage Pro 2_ weather station. Is built on top of the {@link VantInterface}.
 *
 * Offers station dependent features like {@link getRichRealtimeRecord}, {@link getLOOP}, {@link getLOOP2} and {@link getFirmwareVersion}.
 */
export default class VantPro2Interface extends VantInterface {
    /**
     * Creates an interface to your vantage pro 2 weather station using the passed settings. The device should be connected
     * serially. The passed path specifies the path to communicate with the weather station. On Windows paths
     * like `COM1`, `COM2`, ... are common, on osx/linux devices common paths are `/dev/tty0`, `/dev/tty2`, ...
     *
     * @example
     * const device = await VantPro2Interface.create({ path: "COM3" });
     *
     * await device.open();
     * await device.wakeUp();
     *
     * const highsAndLows = await device.getHighsAndLows();
     * inspect(highsAndLows);
     * @param settings the settings
     */
    public static async create(settings: MinimumVantInterfaceSettings) {
        const device = new VantPro2Interface(settings);

        await this.performOnCreateAction(device);

        return device;
    }

    /**
     * Gets the console's firmware version.
     * @returns the console's firmware version
     */
    public async getFirmwareVersion() {
        this.checkPortConnection();
        const data = await this.writeAndWaitForBuffer("NVER\n");
        try {
            const firmwareVersion = data
                .toString("utf-8")
                .split("OK")[1]
                .trim();
            return `v${firmwareVersion}`;
        } catch (err) {
            throw new MalformedDataError();
        }
    }

    /**
     * Gets the LOOP (version 1) package.
     * @returns the LOOP (version 1) package
     */
    public async getLOOP1() {
        this.checkPortConnection();
        const data = await this.writeAndWaitForBuffer("LPS 1 1\n");

        // Check ack
        this.validateAcknowledgementByte(data);

        const packageType = data.readUInt8(5);
        if (packageType === 0) {
            const splittedData = this.splitCRCAckDataPackage(data);

            // Check data (crc check)
            this.validateCRC(splittedData.weatherData, splittedData.crc);

            return new LOOPParser(
                this.rainClicksToInchTransformer,
                this.unitTransformers
            ).parse(splittedData.weatherData);
        } else {
            throw new UnsupportedDeviceModelError(
                "This weather station doesn't support explicitly querying LOOP (version 1) packages. Try getLOOP2() or getDefaultLOOP()."
            );
        }
    }

    /**
     * Gets the LOOP (version 2) package.
     * @returns the LOOP (version 2) package
     */
    public async getLOOP2() {
        this.checkPortConnection();
        const data = await this.writeAndWaitForBuffer("LPS 2 1\n");

        // Check ack
        this.validateAcknowledgementByte(data);

        const packageType = data.readUInt8(5);
        if (packageType !== 0) {
            // LOOP 2 data is splitted (only tested on vantage pro 2)
            const firstPartOfLOOP2 = data;

            const secondPartOfLOOP2 = await this.waitForBuffer();

            const dataFull = Buffer.concat([
                firstPartOfLOOP2,
                secondPartOfLOOP2,
            ]);

            const splittedData = this.splitCRCAckDataPackage(dataFull);

            // Check data (crc check)
            this.validateCRC(splittedData.weatherData, splittedData.crc);

            return new LOOP2Parser(
                this.rainClicksToInchTransformer,
                this.unitTransformers
            ).parse(splittedData.weatherData);
        } else {
            throw new UnsupportedDeviceModelError(
                "This weather station doesn't support LOOP2 packages. Try getLOOP() or getDefaultLOOP()."
            );
        }
    }

    /**
     * Gets detailed weather information from all sensors (internally combining LOOP1 and LOOP2 packages).
     * @returns detailed weather information
     */
    public async getRichRealtimeRecord(): Promise<RichRealtimeRecord> {
        this.checkPortConnection();
        const richRealtimeRecord: RichRealtimeRecord =
            createNullRichRealtimeRecord();

        const loopPackage = (await this.getLOOP1()) as any;
        delete loopPackage["alarms"];
        delete loopPackage["packageType"];
        delete loopPackage["nextArchiveRecord"];
        loopPackage.wind.avg = {
            tenMinutes: loopPackage.wind.avg,
            twoMinutes: null,
        };

        const loop2Package = (await this.getLOOP2()) as any;
        delete loop2Package["packageType"];
        delete loop2Package["graphPointers"];

        merge(richRealtimeRecord, loopPackage);
        merge(richRealtimeRecord, loop2Package);

        richRealtimeRecord.wind.direction = {
            degrees: richRealtimeRecord.wind.direction as unknown as
                | number
                | null,
            abbrevation: this.convertWindDirectionDegreesToAbbrevation(
                richRealtimeRecord.wind.direction as unknown as number | null
            ),
        };

        richRealtimeRecord.wind.heaviestGust10min.direction = {
            degrees: richRealtimeRecord.wind.heaviestGust10min
                .direction as unknown as number | null,
            abbrevation: this.convertWindDirectionDegreesToAbbrevation(
                richRealtimeRecord.wind.heaviestGust10min
                    .direction as unknown as number | null
            ),
        };

        return richRealtimeRecord;
    }
}
