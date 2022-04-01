import { Length, ParseEntry, ParseStructure, Types, parse } from ".";
import { HighLowAlarms } from "../../structures/subtypes";
import inspect from "../inspect";
import { ArrayPipeline, Pipeline } from "./BetterPipeline";
import { ArrayParseEntry } from "./ParseStructure";

class Alarms {
    readonly extraTemps: [
        HighLowAlarms,
        HighLowAlarms,
        HighLowAlarms,
        HighLowAlarms,
        HighLowAlarms,
        HighLowAlarms,
        HighLowAlarms
    ] = [
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
        new HighLowAlarms(),
    ];
}

class LOOP2 {
    readonly alarms: Alarms = new Alarms();
}

const buffer = Buffer.alloc(64);
buffer.writeInt16LE(-23, 0);
buffer.writeInt16LE(3, 2);
buffer.writeInt16LE(1212, 4);
buffer.writeInt16LE(4, 6);

const parsed = parse<LOOP2>(buffer, {
    alarms: {
        extraTemps: [
            {
                low: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(75),
                }),
                high: ParseEntry.create({
                    type: Types.BOOLEAN,
                    offset: Length.BYTES(75).add(Length.BITS(1)),
                }),
            },
            {
                gap: Length.BYTES(1),
                length: 7,
                offset: Length.BYTES(75),
            },
        ],
    },
});

inspect(parsed);
