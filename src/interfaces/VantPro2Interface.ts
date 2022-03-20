import merge from "lodash.merge";
import VantError from "../errors/VantError";
import MalformedDataError from "../errors/MalformedDataError";
import LOOP2Parser from "../parsers/LOOP2Parser";
import LOOPParser from "../parsers/LOOPParser";
import { RichRealtimeRecord } from "../structures/RichRealtimeRecord";
import { LOOP, LOOP2 } from "../structures/LOOP";
import VantInterface from "./VantInterface";
import FailedToSendCommandError from "../errors/FailedToSendCommandError";
import ClosedConnectionError from "../errors/ClosedConnectionError";

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
    public async getFirmwareVersion(): Promise<string> {
        this.checkState();
        return new Promise<string>((resolve, reject) => {
            this.port.write("NVER\n", (err) => {
                if (err) reject(new FailedToSendCommandError());
                this.port.once("data", (data: Buffer) => {
                    const response = data.toString("utf-8");
                    try {
                        const firmwareVersion = response.split("OK")[1].trim();
                        resolve(`v${firmwareVersion}`);
                    } catch (err) {
                        reject(new MalformedDataError());
                    }
                });
            });
        });
    }

    /**
     * Gets the Vantage Pro 2's LOOP package.
     * @returns the Vantage Pro 2's LOOP package
     */
    public async getLOOP(): Promise<LOOP> {
        this.checkState();
        return new Promise<LOOP>((resolve, reject) => {
            this.port.write("LPS 1 1\n", (err) => {
                if (err) reject(new FailedToSendCommandError());
                this.port.once("data", (data: Buffer) => {
                    // Check ack
                    this.validateACK(data);

                    const packageType = data.readUInt8(5);
                    if (packageType === 0) {
                        const splittedData = this.splitCRCAckDataPackage(data);

                        // Check data (crc check)
                        this.validateCRC(
                            splittedData.weatherData,
                            splittedData.crc
                        );

                        resolve(
                            new LOOPParser().parse(splittedData.weatherData)
                        );
                    } else {
                        throw new VantError(
                            "This weather station doesn't support explicitly querying LOOP (version 1) packages. Try getLOOP2() or getDefaultLOOP()."
                        );
                    }
                });
            });
        });
    }

    /**
     * Gets the Vantage Pro 2's LOOP2 package.
     * @returns the Vantage Pro 2's LOOP2 package
     */
    public async getLOOP2(): Promise<LOOP2> {
        this.checkState();
        return new Promise<LOOP2>((resolve, reject) => {
            this.port.write("LPS 2 1\n", (err) => {
                if (err) reject(new FailedToSendCommandError());
                this.port.once("data", (data: Buffer) => {
                    // Check ack
                    this.validateACK(data);

                    const packageType = data.readUInt8(5);
                    if (packageType !== 0) {
                        // LOOP 2 data is splitted (only tested on vantage pro 2)
                        const firstPartOfLOOP2 = data;
                        this.port.once("data", (data: Buffer) => {
                            const dataFull = Buffer.concat([
                                firstPartOfLOOP2,
                                data,
                            ]);
                            const splittedData =
                                this.splitCRCAckDataPackage(dataFull);

                            // Check data (crc check)
                            this.validateCRC(
                                splittedData.weatherData,
                                splittedData.crc
                            );

                            resolve(
                                new LOOP2Parser().parse(
                                    splittedData.weatherData
                                )
                            );
                        });
                    } else {
                        throw new VantError(
                            "This weather station doesn't support LOOP2 packages. Try getLOOP() or getDefaultLOOP()."
                        );
                    }
                });
            });
        });
    }

    /**
     * Gets detailed weather information from all sensors.
     * @returns detailed weather information
     */
    public async getRichRealtimeRecord(): Promise<RichRealtimeRecord> {
        this.checkState();
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

        const loopPackage = (await this.getLOOP()) as any;
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
