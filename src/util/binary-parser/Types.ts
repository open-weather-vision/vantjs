import Length from "./Length";

export class Type<Type> {
    public readonly id: symbol;
    private readonly typeValue?: Type;
    //private readonly UNIQUE_SYMBOL = Symbol();
    public readonly size: Length;

    constructor(id: symbol, size: Length) {
        this.id = id;
        this.size = size;
    }
}

export class StringType extends Type<string> {
    public readonly length: number;
    public readonly encoding: BufferEncoding;

    constructor(id: symbol, length: number, encoding: BufferEncoding = "utf8") {
        super(id, Length.BYTES(0));
        this.length = length;
        this.encoding = encoding;
        throw new Error("Strings are not supported yet!");
    }
}

export default class Types {
    static UINT8 = new Type<number>(Symbol(), Length.BYTES(1));
    static UINT16_LE = new Type<number>(Symbol(), Length.WORDS(1));
    static UINT16 = this.UINT16_LE;
    static UINT16_BE = new Type<number>(Symbol(), Length.WORDS(1));
    static UINT32_LE = new Type<number>(Symbol(), Length.DWORDS(1));
    static UINT32 = this.UINT32_LE;
    static UINT32_BE = new Type<number>(Symbol(), Length.DWORDS(1));
    static INT8 = new Type<number>(Symbol(), Length.BYTES(1));
    static INT16_LE = new Type<number>(Symbol(), Length.WORDS(1));
    static INT16 = this.INT16_LE;
    static INT16_BE = new Type<number>(Symbol(), Length.WORDS(1));
    static INT32_LE = new Type<number>(Symbol(), Length.DWORDS(1));
    static INT32 = this.INT32_LE;
    static INT32_BE = new Type<number>(Symbol(), Length.DWORDS(1));
    static BIT = new Type<number>(Symbol(), Length.BITS(1));
    static BOOLEAN = new Type<boolean>(Symbol(), Length.BITS(1));
    static STRING = (length: number, encoding?: BufferEncoding) => {
        return new StringType(Symbol(), length, encoding);
    };
}
