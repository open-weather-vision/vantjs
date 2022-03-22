import merge from "lodash.merge";
import MalformedDataError from "../errors/MalformedDataError";
import LOOP2Parser from "../parsers/LOOP2Parser";
import LOOPParser from "../parsers/LOOPParser";
import { RichRealtimeRecord } from "../structures/RichRealtimeRecord";
import VantInterface from "./VantInterface";
import UnsupportedDeviceModelError from "../errors/UnsupportedDeviceModelError";

/**
 * Interface to the _Vantage Pro 2_ weather station. Is built on top of the {@link VantInterface}.
 *
 * Offers station dependent features like {@link getRichRealtimeRecord}, {@link getLOOP}, {@link getLOOP2} and {@link getFirmwareVersion}.
 */
export default class VantPro2Interface extends VantInterface {
    /**
     * Gets the console's firmware version.
     * @returns the console's firmware version
     */
    public async getFirmwareVersion() {
        this.validatePort();
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
        this.validatePort();
        const data = await this.writeAndWaitForBuffer("LPS 1 1\n");

        // Check ack
        this.validateAcknowledgementByte(data);

        const packageType = data.readUInt8(5);
        if (packageType === 0) {
            const splittedData = this.splitCRCAckDataPackage(data);

            // Check data (crc check)
            this.validateCRC(splittedData.weatherData, splittedData.crc);

            return new LOOPParser().parse(splittedData.weatherData);
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
        this.validatePort();
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

            return new LOOP2Parser().parse(splittedData.weatherData);
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
        this.validatePort();
        const RichRealtimeRecord: RichRealtimeRecord = {
            pressure: {
                current: null,
                currentRaw: null,
                currentAbsolute: null,
                trend: {
                    value: null,
                    text: null,
                },
                reductionMethod: { value: null, text: null },
                userOffset: null,
                calibrationOffset: null,
            },
            altimeter: null,
            heat: null,
            dewpoint: null,
            temperature: {
                in: null,
                out: null,
                extra: [null, null, null, null, null, null, null],
            },
            leafTemps: [null, null, null, null],
            soilTemps: [null, null, null, null],
            humidity: {
                in: null,
                out: null,
                extra: [null, null, null, null, null, null, null],
            },
            wind: {
                current: null,
                avg: { tenMinutes: null, twoMinutes: null },
                direction: null,
                heaviestGust10min: { direction: null, speed: null },
                chill: null,
                thsw: null,
            },
            rain: {
                rate: null,
                storm: null,
                stormStartDate: null,
                day: null,
                month: null,
                year: null,
                last15min: null,
                lastHour: null,
                last24h: null,
            },
            et: { day: null, month: null, year: null },
            soilMoistures: [null, null, null, null],
            leafWetnesses: [null, null, null, null],
            uv: null,
            solarRadiation: null,
            transmitterBatteryStatus: null,
            consoleBatteryVoltage: null,
            forecast: { iconNumber: null, iconText: null, rule: null },
            sunrise: null,
            sunset: null,
            time: new Date(),
        };

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

        merge(RichRealtimeRecord, loopPackage);
        merge(RichRealtimeRecord, loop2Package);

        return RichRealtimeRecord as RichRealtimeRecord;
    }
}
