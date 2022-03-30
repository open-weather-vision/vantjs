import deepForEach from "deep-for-each";
import numberToBinaryString from "../numberToBinaryString";
import Length from "./Length";
import { ArrayParseEntry, ParseEntry, ParseStructure } from "./ParseStructure";
import Types, { StringType, Type } from "./Types";

export default function parse<Target>(
    buffer: Buffer,
    structure: ParseStructure<Target, false, true>,
    offset?: Length
) {
    return parseRecursively(buffer, structure, undefined, undefined, offset);
}

function parseRecursively<Target extends Record<string | number | symbol, any>>(
    buffer: Buffer,
    structure: ParseStructure<Target, any, any>,
    arrayIndex?: number,
    arrayGap?: Length,
    offset?: Length
): Target {
    const result: Partial<Target> = {};

    const properties: (keyof Target)[] = Object.keys(structure);

    for (let i = 0; i < properties.length; i++) {
        const propertyName = properties[i];
        const propertyValue = structure[propertyName];

        let resolvedValue = undefined;

        // Handle ParseEntry
        if (
            propertyValue instanceof ParseEntry ||
            propertyValue instanceof ArrayParseEntry
        ) {
            const parseEntry = propertyValue as
                | ParseEntry<Target, any, any, any>
                | ArrayParseEntry<any, any>;
            // Handle ParseEntry.copyof
            if (parseEntry.copyof) {
                if (result[parseEntry.copyof] === undefined) {
                    properties.push(propertyName);
                    continue;
                } else {
                    resolvedValue = result[parseEntry.copyof];
                }
                // Handle ParseEntry.create
            } else {
                // Check if required settings are there
                if (!parseEntry.type) {
                    throw new Error(`Missing type at '${propertyName}'!`);
                }
                if (!parseEntry.offset) {
                    throw new Error(`Missing offset at '${propertyName}'!`);
                }
                // Calculate byte offset
                let byteOffset = parseEntry.offset.bytes;
                if (offset) {
                    byteOffset += offset.bytes;
                }
                // If inside array, add index * gap
                if (arrayIndex) {
                    let arrayOffset = arrayIndex;
                    if (arrayGap) {
                        arrayOffset *= arrayGap.bytes;
                    }
                    byteOffset += arrayOffset;
                }
                resolvedValue = read(buffer, parseEntry.type, byteOffset);
                // TODO: Nullables (?)
                // Push resolved value through transform pipeline
                if (parseEntry.transform) {
                    for (const transformer of parseEntry.transform) {
                        resolvedValue = transformer(resolvedValue, arrayIndex!);
                    }
                }
                // Mark dependency
                if (parseEntry.dependsOn) {
                    resolvedValue = new UnresolvedDependency({
                        value: resolvedValue,
                        dependsOn: parseEntry.dependsOn,
                    });
                }
            }
            // Handle []
        } else if (
            propertyValue instanceof Array &&
            propertyValue.length === 2 &&
            (propertyValue[0] instanceof ArrayParseEntry ||
                containsParsableData(propertyValue[0]))
        ) {
            const elementStructure = propertyValue[0] as
                | ArrayParseEntry<any, any>
                | ParseStructure<any, true, false>;
            const length = propertyValue[1].length as number;
            const gap = propertyValue[1].gap as Length;
            const arrayOffset = propertyValue[1].offset as Length;

            resolvedValue = [];
            if (elementStructure instanceof ArrayParseEntry) {
                for (let e = 0; e < length; e++) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const elementValue = parseRecursively(
                        buffer,
                        { value: elementStructure },
                        e,
                        gap,
                        arrayOffset
                    ).value;
                    resolvedValue.push(elementValue);
                }
            } else {
                for (let e = 0; e < length; e++) {
                    const parsedEntry = parseRecursively(
                        buffer,
                        elementStructure,
                        e,
                        gap,
                        arrayOffset
                    );
                    resolvedValue.push(parsedEntry);
                }
            }
        } else {
            if (
                isPrimitive(propertyValue) ||
                !containsParsableData(propertyValue)
            ) {
                resolvedValue = propertyValue;
            } else {
                const nestedStructure = propertyValue as ParseStructure<
                    any,
                    any,
                    any
                >;
                resolvedValue = parseRecursively(
                    buffer,
                    nestedStructure,
                    arrayIndex,
                    arrayGap,
                    offset
                );
            }
        }

        result[propertyName] = resolvedValue;
    }
    return result as Target;
}

function read<T>(buffer: Buffer, type: Type<T>, byteOffset: number): T {
    if (type instanceof StringType) {
        throw new Error("Strings are not supported yet!");
        /*return buffer
            .subarray(byteOffset)
            .toString(type.encoding) as unknown as T;*/
    }

    switch (type.id) {
        case Types.INT8.id:
            // console.log(`Reading INT8 at ${position}`)
            return buffer.readInt8(byteOffset) as unknown as T;
        case Types.INT16_BE.id:
            // console.log(`Reading INT16_BE at ${byteOffset}`)
            return buffer.readInt16BE(byteOffset) as unknown as T;
        case Types.INT16_LE.id:
            // console.log(`Reading INT16_LE at ${byteOffset}`)
            return buffer.readInt16LE(byteOffset) as unknown as T;
        case Types.INT32_BE.id:
            // console.log(`Reading INT32_BE at ${byteOffset}`)
            return buffer.readInt32BE(byteOffset) as unknown as T;
        case Types.INT32_LE.id:
            // console.log(`Reading INT32_LE at ${byteOffset}`)
            return buffer.readInt32LE(byteOffset) as unknown as T;
        case Types.UINT8.id:
            // console.log(`Reading UINT8 at ${byteOffset}`)
            return buffer.readUInt8(byteOffset) as unknown as T;
        case Types.UINT16_BE.id:
            // console.log(`Reading UINT16_BE at ${byteOffset}`)
            return buffer.readUInt16BE(byteOffset) as unknown as T;
        case Types.UINT16_LE.id:
            // console.log(`Reading UINT16_LE at ${byteOffset}`)
            return buffer.readUInt16LE(byteOffset) as unknown as T;
        case Types.UINT32_BE.id:
            // console.log(`Reading UINT32_BE at ${byteOffset}`)
            return buffer.readUInt32BE(byteOffset) as unknown as T;
        case Types.UINT32_LE.id:
            // console.log(`Reading UINT32_LE at ${byteOffset}`)
            return buffer.readUInt32LE(byteOffset) as unknown as T;
        default:
            const bit = Math.round((byteOffset % 1) * 8);
            const byte = Math.trunc(byteOffset);
            const byteString = numberToBinaryString(buffer[byte], 8);
            return Number(byteString[bit]) as unknown as T;
    }
}

class UnresolvedDependency<
    Target extends Record<string | number | symbol, any>,
    T
> {
    public readonly dependsOn: keyof Target;
    public readonly resolvedValue: T;

    constructor(settings: { dependsOn: keyof Target; value: T }) {
        this.dependsOn = settings.dependsOn;
        this.resolvedValue = settings.value;
    }
}

function isParseable(val: any) {
    return val instanceof ArrayParseEntry || val instanceof ParseEntry;
}

function containsParsableData(val: any) {
    let result = false;
    deepForEach(val, (val) => {
        if (isParseable(val)) {
            result = true;
        }
    });
    return result;
}

function isPrimitive(val: any) {
    return (
        (typeof val !== "object" && typeof val !== "function") || val === null
    );
}
