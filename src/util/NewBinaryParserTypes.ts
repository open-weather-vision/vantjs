enum Type {
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

type ArrayWithLength<T, L extends number> = Array<T> & { length: L };

class Length {
    private readonly bits: number;

    private constructor(bits: number) {
        this.bits = bits;
    }

    public static BITS(bits: number) {
        return new Length(bits);
    }

    public static BYTES(bytes: number) {
        return new Length(bytes * 8);
    }

    public static WORDS(words: number) {
        return new Length(words * 16);
    }

    public static DWORDS(dwords: number) {
        return new Length(dwords * 32);
    }

    public static QWORDS(qwords: number) {
        return new Length(qwords * 64);
    }
}

type TransformPipeline<R> =
    | [
          (val: number) => unknown,
          ...Array<(val: unknown) => unknown>,
          (val: unknown) => R
      ]
    | [(val: number) => R];

type ParseEntry<Target, Property extends keyof Target> =
    | {
          type: Type;
          offset: Length;
          transform?: TransformPipeline<Target[Property]>;
          dependsOn?: keyof Target;
      }
    | {
          type: undefined;
          copyof: keyof Target;
          transform?: TransformPipeline<Target[Property]>;
          dependsOn?: keyof Target;
      };

type ArrayParseEntry<Target, ArrayType> =
    | {
          type: Type;
          offset: Length;
          transform?: TransformPipeline<ArrayType>;
          dependsOn?: keyof Target;
      }
    | {
          type: undefined;
          copyof: keyof Target;
          transform?: TransformPipeline<ArrayType>;
          dependsOn?: keyof Target;
      };

type ParseStruct<Target> = {
    [Property in keyof Target]:
        | Target[Property]
        | (Target[Property] extends ArrayWithLength<
              infer ArraysType,
              infer ArrayLength
          >
              ? [
                    ArrayParseEntry<Target, ArraysType>,
                    (
                        | ArrayLength
                        | {
                              length: ArrayLength;
                              gap?: Length;
                          }
                    )
                ]
              : Target[Property] extends Record<string | number | symbol, any>
              ? ParseStruct<Target[Property]>
              : ParseEntry<Target, Property>);
};

type LOOP1 = {
    temperature: number | null;
    wind: {
        speed: number | null;
        direction: string;
    };
    extra: (number | null)[];
    tuple: [string, number, number, null, string];
    packageType: "LOOP1";
};

const a: ParseStruct<LOOP1> = {
    extra: [
        {
            dependsOn: "wind",
            type: Type.BIT,
            offset: Length.BITS(5),
            transform: [
                (val) => {
                    return val;
                },
            ],
        },
        {
            length: 3,
            gap: Length.BITS(3),
        },
    ],
    wind: {
        speed: {
            type: Type.BIT,
            offset: Length.BITS(3),
        },
        direction: {
            type: Type.BIT,
            offset: Length.BYTES(12),
            transform: [
                (val) => {
                    return "a";
                },
            ],
        },
    },
    tuple: [
        {
            type: Type.INT16,
            offset: Length.BITS(2),
            transform: [
                (val) => {
                    return val as number;
                },
            ],
        },
        5,
    ],
    temperature: {
        type: Type.INT16,
        offset: Length.BITS(3),
    },
    packageType: "LOOP1",
};
