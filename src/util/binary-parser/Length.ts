export default class Length {
    private bytes: number;

    private constructor(bytes: number) {
        this.bytes = bytes;
    }

    public static ZERO() {
        return new Length(0);
    }

    public static BITS(bits: number) {
        return new Length(bits === 0 ? 0 : bits / 8);
    }

    public static BYTES(bytes: number) {
        return new Length(bytes);
    }

    public static WORDS(words: number) {
        return new Length(words * 2);
    }

    public static DWORDS(dwords: number) {
        return new Length(dwords * 4);
    }

    public static QWORDS(qwords: number) {
        return new Length(qwords * 8);
    }

    public add(length: Length) {
        this.bytes += length.bytes;
        return this;
    }

    public multiply(factor: number) {
        this.bytes *= factor;
        return this;
    }

    public copy() {
        return new Length(this.bytes);
    }

    public getBytes() {
        return this.bytes;
    }
}
