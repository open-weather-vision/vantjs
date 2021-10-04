import MalformedDataError from "../errors/MalformedDataError";
import ParserError from "../errors/ParserError";
import numberToBinaryString from "./numberToBinaryString";

export enum Type {
    UINT8 = 1,
    UINT16_LE = 2,
    UINT16_BE = 3,
    UINT16 = UINT16_LE,
    UINT32_LE = 4,
    UINT32_BE = 5,
    UINT32 = UINT32_LE,
    INT8 = 6,
    INT16_LE = 7,
    INT16_BE = 8,
    INT16 = INT16_LE,
    INT32_LE = 9,
    INT32_BE = 10,
    INT32 = INT32_LE,
    BIT = 11,
}

export enum ArrayType {
    PROPERTY_BASED = 1,
    ENTRY_BASED = 2,
}

export type PropertyConfig = {
    type: Type,
    position: number,
    nullables?: number[] | string,
    transform?: ((val: number) => any) | string,
    dependsOn?: string,
} | {
    copyof: string,
    nullables?: number[] | string,
    transform?: ((val: number) => any) | string,
    dependsOn?: string,
};

export interface ParsingStructure {
    [propertyName: string]: ParsingStructure | [ParsingStructure | PropertyConfig, number, ArrayType.PROPERTY_BASED] | [ParsingStructure | PropertyConfig, number, ArrayType.ENTRY_BASED, number] | PropertyConfig
}
export interface ParsedObject {
    [propertyName: string]: any | ParsedObject;
}

export interface TransformerCollection { [property: string]: (val: number) => any }
export interface NullablesCollection { [property: string]: number[] }

export default class BinaryParser<T extends ParsedObject> {
    private struct: ParsingStructure;
    private offset = 0;
    private transformers: TransformerCollection = {}
    private nullables: NullablesCollection = {}

    constructor(struct: ParsingStructure, nullables?: NullablesCollection, transformers?: TransformerCollection) {
        this.struct = struct;
        if (transformers) this.transformers = transformers;
        if (nullables) this.nullables = nullables;
    }

    public setTransformer(name: string, transformer: (val: number) => any): void {
        this.transformers[name] = transformer;
    }

    public setNullables(name: string, nullables: number[]): void {
        this.nullables[name] = nullables;
    }

    public parse(buffer: Buffer, offset = 0): T {
        try {
            this.offset = offset;
            return this.parseRecursivly(buffer, this.struct);
        } catch (err) {
            throw new ParserError("Failed to parse data. If this error occurs please contact the developer on github.");
        }
    }

    public byteLength(type: Type): number {
        switch (type) {
            case Type.BIT:
                return 1 / 8;
            case Type.INT8:
            case Type.UINT8:
                return 1;
            case Type.INT16_BE:
            case Type.INT16_LE:
            case Type.UINT16_BE:
            case Type.UINT16_LE:
                return 2;
            case Type.UINT32_BE:
            case Type.UINT32_LE:
            case Type.INT32_BE:
            case Type.INT32_LE:
                return 4;
        }
    }

    private parseRecursivly(buffer: Buffer, struct: ParsingStructure, arrayIndex = 0, entryGap = 0): T {
        let result: ParsedObject = {};

        const propertyKeys = Object.keys(struct);
        for (let i = 0; i < propertyKeys.length; i++) {
            const propertyKey = propertyKeys[i];
            const propertyValue = struct[propertyKey];
            let resolvedValue = undefined;

            if (this.isPropertyConfig(propertyValue)) {
                const propertyConfig = propertyValue as PropertyConfig;
                if ("copyof" in propertyConfig) {
                    if (!propertyKeys.includes(propertyConfig.copyof)) throw new Error("Invalid parse structure. Property is copy of an unknown property.");

                    if (result[propertyConfig.copyof] === undefined) {
                        propertyKeys.push(propertyKey);
                        continue;
                    }
                    resolvedValue = result[propertyConfig.copyof];
                } else {
                    let position = propertyConfig.position;
                    if (arrayIndex && entryGap) {
                        position += entryGap * arrayIndex;
                    }
                    else if (arrayIndex) position += this.byteLength(propertyConfig.type) * arrayIndex;
                    resolvedValue = this.read(buffer, propertyConfig.type, position);
                }
                if (propertyConfig.nullables && resolvedValue !== null) {
                    if (typeof propertyConfig.nullables === "string") {
                        const nullables = this.nullables[propertyConfig.nullables];
                        if (nullables) resolvedValue = this.nullNullables(resolvedValue, nullables);
                        else throw new Error(`Invalid nullables name '${propertyConfig.nullables}!`);
                    }
                    else resolvedValue = this.nullNullables(resolvedValue, propertyConfig.nullables);
                }
                if (propertyConfig.transform && resolvedValue !== null) {
                    if (typeof propertyConfig.transform === "string") {
                        const transformer = this.transformers[propertyConfig.transform];
                        if (transformer) resolvedValue = transformer(resolvedValue);
                        else throw new Error(`Invalid transformer name '${propertyConfig.transform}!`);
                    }
                    else resolvedValue = propertyConfig.transform(resolvedValue);
                }
                if (propertyConfig.dependsOn && resolvedValue !== null) {
                    resolvedValue = { value: resolvedValue, dependsOn: propertyConfig.dependsOn };
                }

            } else if (propertyValue instanceof Array) {
                const structure = propertyValue[0];
                const length = propertyValue[1];
                const entryGap = propertyValue[3] ?? 0;

                resolvedValue = [];
                if (this.isPropertyConfig(structure)) {
                    for (let a = 0; a < length; a++) {
                        const parsedEntry = this.parseRecursivly(buffer, { value: structure }, a, entryGap);
                        resolvedValue.push(parsedEntry.value);
                    }
                } else {
                    for (let a = 0; a < length; a++) {
                        const parsedEntry = this.parseRecursivly(buffer, structure as ParsingStructure, a, entryGap);
                        resolvedValue.push(parsedEntry);
                    }
                }
            } else {
                const nestedStruct = propertyValue as ParsingStructure;
                resolvedValue = this.parseRecursivly(buffer, nestedStruct, arrayIndex);
            }

            result[propertyKey] = resolvedValue;
        }
        result = this.resolveDependencies(result)!;
        return result as T;
    }

    private nullNullables(value: number, nullables: number[]) {
        if (value === null) return null;
        for (let i = 0; i < nullables.length; i++) {
            if (value === nullables[i]) return null;
        }
        return value;
    }

    private resolveDependencies(data: ParsedObject): ParsedObject | null {
        if (data === null) return null;
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let value: any = data[key];
            if (this.isDependencyObject(value)) {
                type DependencyObject = { value: any, dependsOn: string };
                const dependencyObject = value as DependencyObject;
                // Check dependency's value
                if (!keys.includes(dependencyObject.dependsOn)) throw new Error("Invalid parse structure. Property is dependend on unknown property.");
                const dependency = data[dependencyObject.dependsOn];
                const valueOfDependency = this.isDependencyObject(dependency) ? (dependency as DependencyObject).value : dependency;
                if (valueOfDependency === null) value = null;
                else value = dependencyObject.value;
            } else if (value instanceof Array) {
                for (let i = 0; i < value.length; i++) {
                    value[i] = this.resolveDependencies(value[i]);
                }
            } else if (value !== null && typeof value === "object") {
                value = this.resolveDependencies(value);
            }
            data[key] = value;
        }
        return data;
    }

    private isDependencyObject(value: any) {
        return value !== null && typeof value === "object" && value.dependsOn !== undefined && value.dependsOn !== null;
    }

    private read(buffer: Buffer, type: Type, position: number): number | null {
        position += this.offset;
        let result: number | null = null;
        switch (type) {
            case Type.INT8:
                // console.log(`Reading INT8 at ${position}`)
                result = buffer.readInt8(position); break;
            case Type.INT16_BE:
                // console.log(`Reading INT16_BE at ${position}`)
                result = buffer.readInt16BE(position); break;
            case Type.INT16_LE:
                // console.log(`Reading INT16_LE at ${position}`)
                result = buffer.readInt16LE(position); break;
            case Type.INT32_BE:
                // console.log(`Reading INT32_BE at ${position}`)
                result = buffer.readInt32BE(position); break;
            case Type.INT32_LE:
                // console.log(`Reading INT32_LE at ${position}`)
                result = buffer.readInt32LE(position); break;
            case Type.UINT8:
                // console.log(`Reading UINT8 at ${position}`)
                result = buffer.readUInt8(position); break;
            case Type.UINT16_BE:
                // console.log(`Reading UINT16_BE at ${position}`)
                result = buffer.readUInt16BE(position); break;
            case Type.UINT16_LE:
                // console.log(`Reading UINT16_LE at ${position}`)
                result = buffer.readUInt16LE(position); break;
            case Type.UINT32_BE:
                // console.log(`Reading UINT32_BE at ${position}`)
                result = buffer.readUInt32BE(position); break;
            case Type.UINT32_LE:
                // console.log(`Reading UINT32_LE at ${position}`)
                result = buffer.readUInt32LE(position); break;
            case Type.BIT:
                const bitPosition = Math.round((position % 1) * 8);
                const bytePosition = Math.trunc(position);
                const byteString = numberToBinaryString(buffer[bytePosition], 8);
                result = Number(byteString[bitPosition]);
        }
        if (result === undefined) result = null;
        return result;
    }

    private isPropertyConfig(object: any): boolean {
        return object.type || object.copyof;
    }
}

// const buffer = Buffer.alloc(64);
// buffer.writeInt16LE(12);
// buffer.writeInt16LE(24, 2);
// buffer.writeInt16LE(0, 4);
// buffer.writeInt16LE(0, 6);
// buffer.writeInt16LE(1112, 8);

// buffer.writeInt8(3, 10);
// buffer.writeInt8(1, 11);
// buffer.writeInt8(-23, 12);
// buffer.writeInt8(-1, 13);
// buffer.writeInt8(2, 14);

// const parser = new BinaryParser({
//     temps: [{
//         test: {
//             low: {
//                 type: Type.INT16,
//                 position: 0,
//                 nullables: [0],
//                 dependsOn: "high"
//             },
//             high: {
//                 type: Type.INT8,
//                 position: 10,
//                 dependsOn: "low",
//                 nullables: [-1]
//             }
//         }
//     }, 5],
// });

// import inspect from "./inspect";
// inspect(parser.parse(buffer))