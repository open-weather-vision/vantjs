import { Length, ParseEntry, ParseStructure, Types, parse } from ".";
import inspect from "../inspect";
import { ArrayPipeline, Pipeline } from "./BetterPipeline";
import { ArrayParseEntry } from "./ParseStructure";

type LOOP2 = {
    packageType: number | null;
    prop: number | null;
    temperature: (number | null)[];
};

const buffer = Buffer.alloc(64);
buffer.writeInt16LE(-23, 0);
buffer.writeInt16LE(3, 2);
buffer.writeInt16LE(1212, 4);
buffer.writeInt16LE(4, 6);
buffer.writeInt8(-23, 8);

const parsed = parse<LOOP2>(buffer, {
    prop: ParseEntry.create({
        type: Types.INT16,
        offset: Length.BYTES(0),
        nullables: [-23],
        nullWith: "packageType",
    }),
    packageType: ParseEntry.create({
        type: Types.INT8,
        offset: Length.BYTES(8),
        nullables: [-23],
        nullWith: "prop",
    }),
    temperature: [
        ArrayParseEntry.create({
            type: Types.INT16_LE,
            nullables: [3],
            transform: ArrayPipeline((val: number, index) => {
                return val;
            }),
        }),
        {
            length: 4,
            offset: Length.BYTES(0),
        },
    ],
});

inspect(parsed);
