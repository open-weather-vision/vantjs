export class Type<Type> {
    public readonly id: symbol;
    private readonly typeValue?: Type;
    //private readonly UNIQUE_SYMBOL = Symbol();
    public readonly bytes: number;

    constructor(id: symbol, bytes: number) {
        this.id = id;
        this.bytes = bytes;
    }
}

export class StringType extends Type<string> {
    public readonly length: number;
    public readonly encoding: BufferEncoding;

    constructor(id: symbol, length: number, encoding: BufferEncoding = "utf8") {
        super(id, 0);
        this.length = length;
        this.encoding = encoding;
        throw new Error("Strings are not supported yet!");
    }
}

export default class Types {
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
    static BIT = new Type<number>(Symbol(), 1 / 8);
    static STRING = (length: number, encoding?: BufferEncoding) => {
        return new StringType(Symbol(), length, encoding);
    };
}
