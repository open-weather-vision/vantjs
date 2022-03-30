export default class Length {
    public readonly bytes: number;

    private constructor(bytes: number) {
        this.bytes = bytes;
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
}
