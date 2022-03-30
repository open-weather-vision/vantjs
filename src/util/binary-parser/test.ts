import { Length, ParseEntry, ParseStructure, Types, parse } from ".";
import inspect from "../inspect";
import { ArrayParseEntry } from "./ParseStructure";

type LOOP2 = {
    arrayComplex: {
        high: number;
        low: number;
    }[];
};

const buffer = Buffer.alloc(64);
buffer.writeInt16BE(232, 0);
buffer.writeInt16BE(-3, 2);
buffer.writeInt16BE(1212, 4);
buffer.writeInt16BE(4, 6);

const parsed = parse<LOOP2>(buffer, {
    arrayComplex: [
        {
            high: ParseEntry.create({
                type: Types.INT16_BE,
                offset: Length.WORDS(0),
            }),
            low: ParseEntry.create({
                type: Types.INT16_BE,
                offset: Length.WORDS(1),
            }),
        },
        {
            length: 2,
            gap: Length.WORDS(2),
            offset: Length.BYTES(0),
        },
    ],
});

inspect(parsed);
