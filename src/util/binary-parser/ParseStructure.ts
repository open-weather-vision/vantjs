import { ArrayWithLength } from "./ArrayWithLength";
import Length from "./Length";
import { Pipeline } from "./Pipeline";
import Types, { Type } from "./Types";

export class ArrayParseEntry<ArrayType, BaseType> {
    type?: Type<BaseType>;
    offset?: Length;
    transform?: Pipeline<BaseType, ArrayType, true>;
    dependsOn?: keyof ArrayType;
    copyof?: keyof ArrayType;
    private readonly ENTRY_IDENTIFIER = Symbol();

    private constructor(
        type?: Type<BaseType>,
        offset?: Length,
        transform?: Pipeline<BaseType, ArrayType, true>,
        dependsOn?: keyof ArrayType,
        copyOf?: keyof ArrayType
    ) {
        this.type = type;
        this.offset = offset;
        this.transform = transform;
        this.dependsOn = dependsOn;
        this.copyof = copyOf;
    }

    public static create<ArrayType>(blueprint: {
        type: Type<ArrayType>;
        offset: Length;
        transform?: undefined;
    }): ArrayParseEntry<ArrayType, ArrayType>;

    public static create<ArrayType, BaseType>(blueprint: {
        type: Type<BaseType>;
        offset: Length;
        transform: Pipeline<BaseType, ArrayType, true>;
    }): ArrayParseEntry<ArrayType, BaseType>;

    public static create<ArrayType, BaseType>(blueprint: {
        type: Type<BaseType>;
        offset: Length;
        transform?: Pipeline<BaseType, ArrayType, true>;
        dependsOn?: keyof ArrayType;
        copyof?: keyof ArrayType;
    }) {
        return new ArrayParseEntry(
            blueprint.type,
            blueprint.offset,
            blueprint.transform,
            blueprint.dependsOn,
            blueprint.copyof
        );
    }
}

export class ParseEntry<
    Target,
    Property extends keyof Target,
    BaseType,
    InsideArray extends true | false
> {
    type?: Type<BaseType>;
    offset?: Length;
    transform?: Pipeline<BaseType, Target[Property], InsideArray>;
    dependsOn?: keyof Target;
    copyof?: keyof Target;
    private readonly ENTRY_IDENTIFIER = Symbol();

    private constructor(
        type?: Type<BaseType>,
        offset?: Length,
        transform?: Pipeline<BaseType, Target[Property], InsideArray>,
        dependsOn?: keyof Target,
        copyof?: keyof Target
    ) {
        this.type = type;
        this.offset = offset;
        this.transform = transform;
        this.dependsOn = dependsOn;
        this.copyof = copyof;
    }

    /**
     *
     * @param blueprint
     */
    public static create<
        Target,
        Property extends keyof Target,
        BaseType extends Target[Property],
        InsideArray extends true | false
    >(blueprint: {
        type: Type<BaseType>;
        offset: Length;
        transform?: undefined;
    }): ParseEntry<Target, Property, Target[Property], InsideArray>;

    public static create<
        Target,
        Property extends keyof Target,
        BaseType,
        InsideArray extends true | false
    >(blueprint: {
        type: Type<BaseType>;
        offset: Length;
        transform: Pipeline<BaseType, Target[Property], InsideArray>;
    }): ParseEntry<Target, Property, BaseType, InsideArray>;

    public static create<
        Target,
        Property extends keyof Target,
        BaseType,
        InsideArray extends true | false
    >(blueprint: {
        type: Type<BaseType>;
        offset: Length;
        transform?: Pipeline<BaseType, Target[Property], InsideArray>;
        dependsOn?: keyof Omit<Target, Property>;
    }) {
        return new ParseEntry(
            blueprint.type,
            blueprint.offset,
            blueprint.transform,
            blueprint.dependsOn
        );
    }

    public static copyof<
        Target,
        Property extends keyof Target,
        CopyProperty extends keyof Omit<Target, Property>,
        InsideArray extends true | false
    >(blueprint: {
        copyof: CopyProperty;
        transform: Pipeline<
            Target[CopyProperty],
            Target[Property],
            InsideArray
        >;
        dependsOn?: keyof Omit<Target, Property>;
    }) {
        return new ParseEntry(
            undefined,
            undefined,
            blueprint.transform,
            blueprint.dependsOn,
            blueprint.copyof
        );
    }
}

export type ParseStructure<
    Target,
    InsideArray extends true | false,
    AllowConstant extends true | false
> = {
    [Property in keyof Target]:
        | (AllowConstant extends true ? Target[Property] : never)
        | (Target[Property] extends ArrayWithLength<
              infer ArraysType,
              infer ArrayLength
          >
              ? ArraysType extends Record<string | number | symbol, any>
                  ? [
                        (
                            | ArrayParseEntry<ArraysType, any>
                            | ParseStructure<ArraysType, true, false>
                        ),
                        {
                            length: ArrayLength;
                            gap: Length;
                            offset: Length;
                        }
                    ]
                  : [
                        ArrayParseEntry<ArraysType, any>,
                        {
                            length: ArrayLength;
                            gap: Length;
                            offset: Length;
                        }
                    ]
              : Target[Property] extends Record<string, any>
              ?
                    | ParseEntry<Target, Property, any, InsideArray>
                    | ParseStructure<
                          Target[Property],
                          InsideArray,
                          AllowConstant
                      >
              : ParseEntry<Target, Property, any, InsideArray>);
};
