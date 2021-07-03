
enum Type {
    UINT8,
    UINT16_LE,
    UINT16_BE,
    UINT16 = UINT16_LE,
    UINT32_LE,
    UINT32_BE,
    UINT32 = UINT32_LE,
    INT8,
    INT16_LE,
    INT16_BE,
    INT16 = INT16_LE,
    INT32_LE,
    INT32_BE,
    INT32 = INT32_LE,
}

type PropertyConfig = {
    type: Type,
    position: number,
    nullables?: number[],
    transform?: (val: number) => any,
    dependsOn?: string,
}

interface ParsingStructure {
    [propertyName: string]: ParsingStructure | [ParsingStructure, number] | PropertyConfig
}
interface ParsedObject {
    [propertyName: string]: any | ParsedObject;
}

export default class BinaryParser {
    private struct: ParsingStructure;

    constructor(struct: ParsingStructure) {
        this.struct = struct;
    }

    public parse(buffer: Buffer): ParsedObject {
        return this.parseRecursivly(buffer, this.struct);
    }

    public byteLength(type: Type): number {
        switch (type) {
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

    private parseRecursivly(buffer: Buffer, struct: ParsingStructure, arrayIndex = 0): ParsedObject {
        const result: ParsedObject = {};

        const propertyKeys = Object.keys(struct);
        for (let i = 0; i < propertyKeys.length; i++) {
            const propertyKey = propertyKeys[i];
            const propertyValue = struct[propertyKey];
            let resolvedValue = undefined;

            if (this.isPropertyConfig(propertyValue)) {
                const propertyConfig = propertyValue as PropertyConfig;
                if (propertyConfig.dependsOn) {
                    // if the dependency has not been parsed until now...
                    if (result[propertyConfig.dependsOn] === undefined) {
                        // if the dependency cannot be found in the current layer, throw an exception
                        if (!propertyKeys.includes(propertyConfig.dependsOn)) throw new Error("Invalid parse structure. Property is dependend on unknown property.")
                        // if the dependency was found in the current layer, move the dependend property to the end of the property list
                        propertyKeys.push(propertyKey);
                        continue;
                        // if the dependency has already been parsed
                    } else {
                        // if the dependency is null, set the property to null to
                        if (result[propertyConfig.dependsOn] === null) resolvedValue = null;
                    }
                }
                if (resolvedValue === undefined) {
                    let position = propertyConfig.position;
                    if (arrayIndex) position += this.byteLength(propertyConfig.type) * arrayIndex;
                    resolvedValue = this.read(buffer, propertyConfig.type, position);
                    if (propertyConfig.nullables && resolvedValue !== null) resolvedValue = this.nullNullables(resolvedValue, propertyConfig.nullables);
                    if (propertyConfig.transform && resolvedValue !== null) resolvedValue = propertyConfig.transform(resolvedValue);
                }
            } else if (propertyValue instanceof Array) {
                const length = propertyValue[1];
                const structure = propertyValue[0];

                resolvedValue = [];
                for (let a = 0; a < length; a++) {
                    const parsedEntry = this.parseRecursivly(buffer, structure, a);
                    resolvedValue.push(parsedEntry);
                }
            } else {
                const nestedStruct = propertyValue as ParsingStructure;
                resolvedValue = this.parseRecursivly(buffer, nestedStruct);
            }

            result[propertyKey] = resolvedValue;
        }
        return result;
    }

    private nullNullables(value: number, nullables: number[]) {
        if (value === null) return null;
        for (let i = 0; i < nullables.length; i++) {
            if (value === nullables[i]) return null;
        }
        return value;
    }

    private read(buffer: Buffer, type: Type, position: number): number | null {
        let result: number | null = null;
        switch (type) {
            case Type.INT8:
                console.log(`Reading INT8 at ${position}`)
                result = buffer.readInt8(position); break;
            case Type.INT16_BE:
                console.log(`Reading INT16_BE at ${position}`)
                result = buffer.readInt16BE(position); break;
            case Type.INT16_LE:
                console.log(`Reading INT16_LE at ${position}`)
                result = buffer.readInt16LE(position); break;
            case Type.INT32_BE:
                console.log(`Reading INT32_BE at ${position}`)
                result = buffer.readInt32BE(position); break;
            case Type.INT32_LE:
                console.log(`Reading INT32_LE at ${position}`)
                result = buffer.readInt32LE(position); break;
            case Type.UINT8:
                console.log(`Reading UINT8 at ${position}`)
                result = buffer.readUInt8(position); break;
            case Type.UINT16_BE:
                console.log(`Reading UINT16_BE at ${position}`)
                result = buffer.readUInt16BE(position); break;
            case Type.UINT16_LE:
                console.log(`Reading UINT16_LE at ${position}`)
                result = buffer.readUInt16LE(position); break;
            case Type.UINT32_BE:
                console.log(`Reading UINT32_BE at ${position}`)
                result = buffer.readUInt32BE(position); break;
            case Type.UINT32_LE:
                console.log(`Reading UINT32_LE at ${position}`)
                result = buffer.readUInt32LE(position); break;
        }
        if (result === undefined) result = null;
        return result;
    }

    private isPropertyConfig(object: any): boolean {
        const validType = (object.type && (object.type === Type.INT16 || object.type === Type.INT8 || object.type === Type.UINT16 || object.type === Type.UINT8));
        return validType;
    }
}

const buffer = Buffer.alloc(64);
buffer.writeInt16LE(12);
buffer.writeInt16LE(24, 2);
buffer.writeInt16LE(0, 4);
buffer.writeInt16LE(-22, 6);
buffer.writeInt16LE(1112, 8);

buffer.writeInt8(3, 10);
buffer.writeInt8(1, 11);
buffer.writeInt8(-23, 12);
buffer.writeInt8(-11, 13);
buffer.writeInt8(2, 14);

const parser = new BinaryParser({
    temps: [{
        day: {
            type: Type.INT16,
            position: 0,
            nullables: [0],
        },
        dayTime: {
        },
    }, 5],
});

console.log(parser.parse(buffer))