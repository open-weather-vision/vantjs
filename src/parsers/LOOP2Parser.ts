import BinaryParser, { Type } from "../util/BinaryParser";
import { RealtimePackage } from "../VantageInterface";
import nullables from "./assets/nullables";
import transformers from "./assets/transformers";

/**
 * Parser for a LOOP2 binary data package (without the acknowledgement byte and the crc bytes).
 */
export default class LOOP2Parser extends BinaryParser {
    constructor() {
        super({
            pressure: {
                current: {
                    type: Type.UINT16, position: 7, transform: "pressure", nullables: "pressure",
                },
                currentRaw: { type: Type.INT16, position: 65, transform: "pressure" },
                currentAbsolute: { type: Type.INT16, position: 67, transform: "pressure" },
                trend: {
                    value: {
                        type: Type.INT8,
                        position: 3,
                        transform: (value) => {
                            switch (value) {
                                case -60:
                                case -20:
                                case 0:
                                case 20:
                                case 60:
                                    return value;
                                default: return null;
                            }
                        }
                    },
                    text: {
                        copyof: "value",
                        transform: (value) => {
                            switch (value) {
                                case -60:
                                    return "Falling Rapidly";
                                case -20:
                                    return "Falling Slowly";
                                case 0:
                                    return "Steady";
                                case 20:
                                    return "Rising Slowly";
                                case 60:
                                    return "Rising Rapidly";
                                default: return null;
                            }
                        }
                    }
                },
                reductionMethod: {
                    value: { type: Type.UINT8, position: 60 },
                    text: {
                        copyof: "value", transform: (val) => {
                            switch (val) {
                                case 0:
                                    return "user offset";
                                case 1:
                                    return "altimeter setting";
                                case 2:
                                    return "NOAA bar reduction";
                                default: return null;
                            }
                        }
                    }
                },
                userOffset: { type: Type.INT16, position: 61, transform: (val) => val / 1000 },
                calibrationOffset: { type: Type.INT16, position: 63, transform: (val) => val / 1000 },
            },
            altimeter: { type: Type.INT16, position: 69, transform: (val) => val / 1000 },
            heat: { type: Type.INT16, position: 35, nullables: [255] },
            dewpoint: { type: Type.INT16, position: 30, nullables: [255] },
            temperature: {
                in: { type: Type.INT16, position: 9, nullables: "temperature", transform: "temperature" },
                out: { type: Type.INT16, position: 12, nullables: "temperature", transform: "temperature" },
            },
            humidity: {
                in: { type: Type.UINT8, position: 11, nullables: "humidity" },
                out: { type: Type.UINT8, position: 33, nullables: "humidity" }
            },
            wind: {
                current: { type: Type.UINT8, position: 14 },
                avg: {
                    tenMinutes: { type: Type.UINT16, position: 18, transform: (val) => val / 10 },
                    twoMinutes: { type: Type.UINT16, position: 20, transform: (val) => val / 10 },
                },
                direction: { type: Type.UINT16, position: 16, nullables: [0] },
                heaviestGust10min: {
                    direction: { type: Type.UINT16, position: 24, nullables: [0] },
                    speed: { type: Type.UINT16, position: 22, transform: (val) => val / 10 },
                },
                chill: { type: Type.INT16, position: 37, nullables: [255] },
                thsw: { type: Type.INT16, position: 39, nullables: [255] },
            },
            rain: {
                rate: { type: Type.UINT16, position: 41 },
                storm: { type: Type.UINT16, position: 46 },
                // TODO: Parse storm start date
                stormStartDate: { type: Type.INT16, position: 48, nullables: [-1] },
                day: { type: Type.UINT16, position: 50 },
                last15min: { type: Type.UINT16, position: 52 },
                lastHour: { type: Type.UINT16, position: 54 },
                last24h: { type: Type.UINT16, position: 58 },
            },
            et: {
                day: { type: Type.UINT16, position: 56, nullables: [65535], transform: (val) => val * 1000 },
            },
            uv: { type: Type.UINT8, position: 43, nullables: "uv" },
            solarRadiation: { type: Type.UINT16, position: 44, nullables: "solar" },
            // TODO: Parse graph data
        }, nullables, transformers);
    }

    public parse(buffer: Buffer): any {
        const result = super.parse(buffer);
        result.packageType = RealtimePackage.LOOP2;
        return result as any;
    }
}