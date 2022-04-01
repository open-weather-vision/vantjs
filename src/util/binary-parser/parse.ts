import deepForEach from "deep-for-each";
import numberToBinaryString from "../numberToBinaryString";
import Length from "./Length";
import {
    ArrayParseEntry,
    NotFinishedResult,
    ParseEntry,
    ParseStructure,
    RecursiveParseStructure,
} from "./ParseStructure";
import Types, { StringType, Type } from "./Types";

export default function parse<Target>(
    buffer: Buffer,
    structure: ParseStructure<Target>,
    offset?: Length
) {
    return parseRecursively(buffer, structure, undefined, undefined, offset);
}

function parseRecursively<Target extends Record<string | number | symbol, any>>(
    buffer: Buffer,
    structure: RecursiveParseStructure<Target, any, any>,
    arrayIndex?: number,
    arrayGap?: Length,
    offset?: Length
): Target {
    const result: NotFinishedResult<Target> = {};

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
                | ArrayParseEntry<Target, any, any>;

            if (parseEntry.dependsOn) {
                // Handle ParseEntry.dependsOn
                if (result[parseEntry.dependsOn] === undefined) {
                    properties.push(propertyName);
                    continue;
                } else {
                    resolvedValue = result[parseEntry.dependsOn];
                }
            } else {
                // Handle ParseEntry.create/ArrayParseEntry.create

                // Calculate byte offset
                const entryOffset = Length.ZERO();

                // Add parse entry offset
                if (
                    propertyValue instanceof ParseEntry &&
                    propertyValue.offset
                ) {
                    entryOffset.add(propertyValue.offset);
                }

                if (offset) {
                    entryOffset.add(offset);
                }
                // If inside array, add index * gap
                if (arrayIndex) {
                    let arrayOffset: Length;
                    if (arrayGap) {
                        arrayOffset = arrayGap.copy();
                    } else {
                        // Automatically calculate array gap (based on entry type) if no gap is passed
                        arrayOffset = parseEntry.type!.size.copy();
                    }
                    arrayOffset.multiply(arrayIndex);
                    entryOffset.add(arrayOffset);
                }
                resolvedValue = read(buffer, parseEntry.type!, entryOffset);
            }

            // Null resolved value if it matches a nullable
            if (parseEntry.nullables) {
                for (const nullable of parseEntry.nullables as any[]) {
                    if (nullable === resolvedValue) {
                        resolvedValue = null;
                        break;
                    }
                }
            }

            // Handle nullWith
            if (resolvedValue !== null && parseEntry.nullWith) {
                resolvedValue = new UnresolvedDependency({
                    resolvedValue: resolvedValue,
                    nullWith: parseEntry.nullWith,
                });
            }

            // Push resolved value through transform pipeline if it's not null (!)
            if (resolvedValue !== null && parseEntry.transform) {
                if (resolvedValue instanceof UnresolvedDependency) {
                    resolvedValue.resolvedValue = parseEntry.transform(
                        resolvedValue.resolvedValue,
                        arrayIndex!
                    );
                } else {
                    resolvedValue = parseEntry.transform(
                        resolvedValue,
                        arrayIndex!
                    );
                }
            }
        } else if (
            // Handle []
            propertyValue instanceof Array &&
            propertyValue.length === 2 &&
            (propertyValue[0] instanceof ArrayParseEntry ||
                containsParsableData(propertyValue[0]))
        ) {
            const elementStructure = propertyValue[0] as
                | ArrayParseEntry<any, any, any>
                | RecursiveParseStructure<any, true, false>;
            const length = propertyValue[1].length as number;
            const gap = propertyValue[1].gap as Length;
            const arrayOffset = propertyValue[1].offset as Length;

            resolvedValue = [];
            if (elementStructure instanceof ArrayParseEntry) {
                // Handle ArrayParseEntry in array [ArrayParseEntry, {}]
                for (let e = 0; e < length; e++) {
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
                // Handle parse structure in array [{...}, {}]
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
                // Handle constant assignment
                resolvedValue = propertyValue;
            } else {
                // Handle nested structure {...}
                const nestedStructure =
                    propertyValue as RecursiveParseStructure<any, any, any>;
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
    return resolveDependencies(result);
}

function resolveDependencies<
    Target extends Record<string | number | symbol, any>
>(data: NotFinishedResult<Target>): Target {
    deepForEach(data, (val, key, subject) => {
        if (val instanceof UnresolvedDependency) {
            let dependency = subject[val.nullWith];
            const dependencyGroup = [key, val.nullWith];
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (dependency === null) {
                    dependencyGroup.pop();
                    for (const key of dependencyGroup) {
                        subject[key] = null;
                    }
                    break;
                } else if (dependency instanceof UnresolvedDependency) {
                    if (dependency.nullWith === key) {
                        for (const key of dependencyGroup) {
                            subject[key] = subject[key].resolvedValue;
                        }
                        break;
                    }
                    dependencyGroup.push(dependency.nullWith);
                    dependency = subject[dependency.nullWith];
                } else {
                    dependencyGroup.pop();
                    for (const key of dependencyGroup) {
                        subject[key] = subject[key].resolvedValue;
                    }
                    break;
                }
            }
        }
    });
    return data as Target;
}

function read<T>(buffer: Buffer, type: Type<T>, offset: Length): T {
    if (type instanceof StringType) {
        throw new Error("Strings are not supported yet!");
        /*return buffer
            .subarray(byteOffset)
            .toString(type.encoding) as unknown as T;*/
    }

    switch (type.id) {
        case Types.INT8.id:
            // console.log(`Reading INT8 at ${position}`)
            return buffer.readInt8(offset.getBytes()) as unknown as T;
        case Types.INT16_BE.id:
            // console.log(`Reading INT16_BE at ${offset.getBytes()}`)
            return buffer.readInt16BE(offset.getBytes()) as unknown as T;
        case Types.INT16_LE.id:
            // console.log(`Reading INT16_LE at ${offset.getBytes()}`)
            return buffer.readInt16LE(offset.getBytes()) as unknown as T;
        case Types.INT32_BE.id:
            // console.log(`Reading INT32_BE at ${offset.getBytes()}`)
            return buffer.readInt32BE(offset.getBytes()) as unknown as T;
        case Types.INT32_LE.id:
            // console.log(`Reading INT32_LE at ${offset.getBytes()}`)
            return buffer.readInt32LE(offset.getBytes()) as unknown as T;
        case Types.UINT8.id:
            // console.log(`Reading UINT8 at ${offset.getBytes()}`)
            return buffer.readUInt8(offset.getBytes()) as unknown as T;
        case Types.UINT16_BE.id:
            // console.log(`Reading UINT16_BE at ${offset.getBytes()}`)
            return buffer.readUInt16BE(offset.getBytes()) as unknown as T;
        case Types.UINT16_LE.id:
            // console.log(`Reading UINT16_LE at ${offset.getBytes()}`)
            return buffer.readUInt16LE(offset.getBytes()) as unknown as T;
        case Types.UINT32_BE.id:
            // console.log(`Reading UINT32_BE at ${offset.getBytes()}`)
            return buffer.readUInt32BE(offset.getBytes()) as unknown as T;
        case Types.UINT32_LE.id:
            // console.log(`Reading UINT32_LE at ${offset.getBytes()}`)
            return buffer.readUInt32LE(offset.getBytes()) as unknown as T;
        case Types.BOOLEAN.id:
            let bit = Math.round((offset.getBytes() % 1) * 8);
            let byte = Math.trunc(offset.getBytes());
            let byteString = numberToBinaryString(buffer[byte], 8);
            return (Number(byteString[bit]) === 1) as unknown as T;
        case Types.BIT.id:
            bit = Math.round((offset.getBytes() % 1) * 8);
            byte = Math.trunc(offset.getBytes());
            byteString = numberToBinaryString(buffer[byte], 8);
            return Number(byteString[bit]) as unknown as T;
        default:
            throw new Array("Type not supported!");
    }
}

export class UnresolvedDependency<
    Target extends Record<string | number | symbol, any>,
    PropertyType
> {
    public readonly nullWith: keyof Target;
    public resolvedValue: PropertyType;

    constructor(settings: {
        nullWith: keyof Target;
        resolvedValue: PropertyType;
    }) {
        this.nullWith = settings.nullWith;
        this.resolvedValue = settings.resolvedValue;
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
