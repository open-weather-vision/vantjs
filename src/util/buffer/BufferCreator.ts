export class Type<Type> {
    public readonly id: symbol;
    public readonly value?: Type;
    public readonly size: number;

    constructor(id: symbol, size: number) {
        this.id = id;
        this.size = size;
    }
}

export class Types {
    static UINT8 = new Type<number>(Symbol(), 1);
    static UINT16_LE = new Type<number>(Symbol(), 2);
    static UINT16 = this.UINT16_LE;
    static UINT16_BE = new Type<number>(Symbol(), 2);
    static UINT32_LE = new Type<number>(Symbol(), 4);
    static UINT32 = this.UINT32_LE;
    static UINT32_BE = new Type<number>(Symbol(), 4);
    static INT8 = new Type<number>(Symbol(), 1);
    static INT16_LE = new Type<number>(Symbol(), 2);
    static INT16 = this.INT16_LE;
    static INT16_BE = new Type<number>(Symbol(), 2);
    static INT32_LE = new Type<number>(Symbol(), 4);
    static INT32 = this.INT32_LE;
    static INT32_BE = new Type<number>(Symbol(), 4);
    static STRING_ASCII = new Type<string>(Symbol(), 1);
}

export class TypedValue<T> {
    public readonly value: T;
    public readonly type: Type<T>;

    constructor(value: T, type: Type<T>) {
        this.value = value;
        this.type = type;
    }
}

const buffer = Buffer.alloc(2);
buffer.write;

export default function createBuffer(...values: TypedValue<any>[]) {
    let bufferLength = 0;
    for (const value of values) {
        if (value.type.id === Types.STRING_ASCII.id) {
            bufferLength += value.type.size * value.value.length;
        } else {
            bufferLength += value.type.size;
        }
    }

    const buffer = Buffer.alloc(bufferLength);

    let byteOffset = 0;
    for (const value of values) {
        switch (value.type.id) {
            case Types.UINT8.id:
                buffer.writeUInt8(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.UINT16_LE.id:
                buffer.writeUInt16LE(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.UINT16_BE.id:
                buffer.writeUInt16BE(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.UINT32_LE.id:
                buffer.writeUInt32LE(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.UINT32_BE.id:
                buffer.writeUInt32BE(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.INT8.id:
                buffer.writeInt8(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.INT16_LE.id:
                buffer.writeInt16LE(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.INT16_BE.id:
                buffer.writeInt16BE(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.INT32_LE.id:
                buffer.writeInt32LE(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.INT32_BE.id:
                buffer.writeInt32BE(value.value, byteOffset);
                byteOffset += value.type.size;
                break;
            case Types.STRING_ASCII.id:
                buffer.write(
                    value.value,
                    byteOffset,
                    bufferLength - byteOffset,
                    "ascii"
                );
                byteOffset += value.type.size * value.value.length;
                break;
        }
    }
    return buffer;
}
