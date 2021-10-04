import merge from "lodash.merge";
import VantError, { ErrorType } from "../errors/VantError";
import SerialConnectionError from "../errors/SerialConnectionError";
import LOOP2Parser from "../parsers/LOOP2Parser";
import LOOPParser from "../parsers/LOOPParser";
import { RichRealtimeRecord } from "../structures/RichRealtimeRecord";
import { LOOP, LOOP2 } from "../structures/LOOP";
import VantInterface from "./VantInterface"

export default class VantPro2Interface extends VantInterface {
    /**
     * Gets the console's firmware version. Only works on Vantage Pro 2 or Vantage Vue.
     * @returns the console's firmware version
     */
    public async getFirmwareVersion(): Promise<string> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
        return new Promise<string>((resolve, reject) => {
            this.port.write("NVER\n", (err) => {
                if (err) reject(new VantError("Failed to get firmware version", ErrorType.FAILED_TO_WRITE));
                this.port.once("data", (data: Buffer) => {
                    const response = data.toString("utf-8");
                    try {
                        const firmwareVersion = response.split("OK")[1].trim();
                        resolve(`v${firmwareVersion}`);
                    } catch (err) {
                        reject(new VantError("Failed to get firmware version", ErrorType.INVALID_RESPONSE));
                    }
                });
            });
        })
    }

    public async getLOOP(): Promise<LOOP> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
        return new Promise<LOOP>((resolve, reject) => {
            this.port.write("LPS 1 1\n", (err) => {
                if (err) reject(new VantError("Failed to get realtime data", ErrorType.FAILED_TO_WRITE));
                this.port.once("data", (data: Buffer) => {
                    // Check ack
                    this.validateACK(data);

                    const packageType = data.readUInt8(5);
                    if (packageType === 0) {
                        const splittedData = this.splitCRCAckDataPackage(data);

                        // Check data (crc check)
                        this.validateCRC(splittedData.weatherData, splittedData.crc);

                        resolve(new LOOPParser().parse(splittedData.weatherData));
                    } else {
                        throw new VantError("This weather station doesn't support explicitly querying LOOP (version 1) packages. Try getLOOP2() or getDefaultLOOP().");
                    }
                });
            });

        });
    }

    public async getLOOP2(): Promise<LOOP2> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
        return new Promise<LOOP2>((resolve, reject) => {
            this.port.write("LPS 2 1\n", (err) => {
                if (err) reject(new VantError("Failed to get realtime data", ErrorType.FAILED_TO_WRITE));
                this.port.once("data", (data: Buffer) => {
                    // Check ack
                    this.validateACK(data);

                    const packageType = data.readUInt8(5);
                    if (packageType !== 0) {
                        // LOOP 2 data is splitted (only tested on vantage pro 2)
                        const firstPartOfLOOP2 = data;
                        this.port.once("data", (data: Buffer) => {
                            const dataFull = Buffer.concat([firstPartOfLOOP2, data]);
                            const splittedData = this.splitCRCAckDataPackage(dataFull);

                            // Check data (crc check)
                            this.validateCRC(splittedData.weatherData, splittedData.crc);

                            resolve(new LOOP2Parser().parse(splittedData.weatherData));
                        });
                    } else {
                        throw new VantError("This weather station doesn't support LOOP2 packages. Try getLOOP() or getDefaultLOOP().");
                    }
                });
            });

        });
    }

    public async getRichRealtimeRecord(): Promise<RichRealtimeRecord> {
        if (this.isClosed) throw new SerialConnectionError("Connection to device has been closed already!");
        const RichRealtimeRecord: RichRealtimeRecord = {
            pressure: {
                current: null,
                currentRaw: null,
                currentAbsolute: null,
                trend: {
                    value: null,
                    text: null
                },
                reductionMethod: { value: null, text: null },
                userOffset: null,
                calibrationOffset: null
            },
            altimeter: null,
            heat: null,
            dewpoint: null,
            temperature: {
                in: null,
                out: null,
                extra: [
                    null, null,
                    null, null,
                    null, null,
                    null
                ]
            },
            leafTemps: [null, null, null, null],
            soilTemps: [null, null, null, null],
            humidity: {
                in: null,
                out: null,
                extra: [
                    null, null,
                    null, null,
                    null, null,
                    null
                ]
            },
            wind: {
                current: null,
                avg: { tenMinutes: null, twoMinutes: null },
                direction: null,
                heaviestGust10min: { direction: null, speed: null },
                chill: null,
                thsw: null
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
                last24h: null
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
        let loopPackage: any;
        let loop2Package: any;
        try {
            loopPackage = await this.getLOOP();
            delete loopPackage["alarms"];
            delete loopPackage["packageType"];
            delete loopPackage["nextArchiveRecord"];
            loopPackage.wind.avg = { tenMinutes: loopPackage.wind.avg, twoMinutes: null };

            loop2Package = await this.getLOOP2();
            delete loop2Package["packageType"];
            delete loop2Package["graphPointers"];

            merge(RichRealtimeRecord, loopPackage);
            merge(RichRealtimeRecord, loop2Package);
        } catch (err) {
            // TODO: handle error
            console.error(err);
        }

        return RichRealtimeRecord as RichRealtimeRecord;
    }
}