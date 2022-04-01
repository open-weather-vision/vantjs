import { ArrayWithLength } from "./ArrayWithLength";
import { TransformFunction } from "./BetterPipeline";
import Length from "./Length";
import { UnresolvedDependency } from "./parse";
//import { Pipeline } from "./Pipeline";
import { Type } from "./Types";

export class ArrayParseEntry<
    ArrayType,
    TransformResultType extends ArrayType,
    BaseType
> {
    type?: Type<BaseType>;
    transform?: TransformFunction<BaseType, TransformResultType, true>;
    nullables?: [null] extends [ArrayType] ? BaseType[] : undefined;
    nullWith?: undefined;
    dependsOn?: undefined;
    private readonly ENTRY_IDENTIFIER = Symbol();

    private constructor(
        transform?: TransformFunction<BaseType, TransformResultType, true>,
        type?: Type<BaseType>,
        nullables?: [null] extends [ArrayType] ? BaseType[] : undefined
    ) {
        this.transform = transform;
        this.type = type;
        this.nullables = nullables;
    }

    public static create<ArrayType, BaseType extends ArrayType>(options: {
        type: Type<BaseType>;
        nullables?: [null] extends [ArrayType] ? BaseType[] : undefined;
        transform?: undefined;
    }): ArrayParseEntry<ArrayType, any, BaseType>;

    public static create<
        ArrayType,
        TransformResultType extends ArrayType,
        BaseType
    >(options: {
        type: Type<BaseType>;
        transform: TransformFunction<BaseType, TransformResultType, true>;
        nullables?: [null] extends [ArrayType] ? BaseType[] : undefined;
    }): ArrayParseEntry<ArrayType, TransformResultType, BaseType>;

    public static create<
        ArrayType,
        TransformResultType extends ArrayType,
        BaseType
    >(options: {
        type: Type<BaseType>;
        transform?: TransformFunction<BaseType, TransformResultType, true>;
        nullables?: [null] extends [ArrayType] ? BaseType[] : undefined;
    }) {
        return new ArrayParseEntry(
            options.transform,
            options.type,
            options.nullables
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
    transform?: TransformFunction<BaseType, Target[Property], InsideArray>;
    nullWith?: null extends Target[Property]
        ? keyof Omit<Target, Property>
        : undefined;
    dependsOn?: keyof Omit<Target, Property>;
    nullables?: null extends Target[Property]
        ? Exclude<BaseType, null>[]
        : undefined;
    private readonly ENTRY_IDENTIFIER = Symbol();

    private constructor(
        type?: Type<BaseType>,
        offset?: Length,
        transform?: TransformFunction<BaseType, Target[Property], InsideArray>,
        nullWith?: null extends Target[Property]
            ? keyof Omit<Target, Property>
            : undefined,
        dependsOn?: keyof Omit<Target, Property>,
        nullables?: null extends Target[Property]
            ? Exclude<BaseType, null>[]
            : undefined
    ) {
        this.type = type;
        this.offset = offset;
        this.transform = transform;
        this.nullWith = nullWith;
        this.dependsOn = dependsOn;
        this.nullables = nullables;
    }

    public static create<
        Target,
        Property extends keyof Target,
        BaseType,
        InsideArray extends true | false
    >(options: {
        type: Type<BaseType>;
        offset: Length;
        transform: TransformFunction<BaseType, Target[Property], InsideArray>;
        nullWith?: null extends Target[Property]
            ? keyof Omit<Target, Property>
            : undefined;
        nullables?: null extends Target[Property]
            ? Exclude<BaseType, null>[]
            : undefined;
    }): ParseEntry<Target, Property, BaseType, InsideArray>;

    public static create<
        Target,
        Property extends keyof Target,
        BaseType extends Target[Property],
        InsideArray extends true | false
    >(options: {
        type: Type<BaseType>;
        offset: Length;
        transform?: undefined;
        nullWith?: null extends Target[Property]
            ? keyof Omit<Target, Property>
            : undefined;
        nullables?: null extends Target[Property]
            ? Exclude<BaseType, null>[]
            : undefined;
    }): ParseEntry<Target, Property, Target[Property], InsideArray>;

    public static create<
        Target,
        Property extends keyof Target,
        BaseType,
        InsideArray extends true | false
    >(options: {
        type: Type<BaseType>;
        offset: Length;
        transform?: TransformFunction<BaseType, Target[Property], InsideArray>;
        nullWith?: null extends Target[Property]
            ? keyof Omit<Target, Property>
            : undefined;
        nullables?: null extends Target[Property]
            ? Exclude<BaseType, null>[]
            : undefined;
    }) {
        return new ParseEntry(
            options.type,
            options.offset,
            options.transform,
            options.nullWith,
            undefined,
            options.nullables
        );
    }

    public static dependsOn<
        Target,
        Property extends keyof Target,
        DependencyProperty extends keyof Omit<Target, Property>,
        InsideArray extends true | false
    >(options: {
        dependsOn: DependencyProperty;
        transform: TransformFunction<
            Target[DependencyProperty],
            Target[Property],
            InsideArray
        >;
        nullables?: null extends Target[Property]
            ? Exclude<Target[DependencyProperty], null>[]
            : undefined;
        nullWith?: null extends Target[Property]
            ? keyof Omit<Target, Property>
            : undefined;
    }) {
        return new ParseEntry(
            undefined,
            undefined,
            options.transform,
            options.nullWith,
            options.dependsOn,
            options.nullables
        );
    }
}

export type ParseStructure<Target> = RecursiveParseStructure<
    Target,
    false,
    true
>;

export type ArraySettings<ArrayLength extends number> = {
    length: ArrayLength;
    gap?: Length;
    offset: Length;
};

export type RecursiveParseStructure<
    Target,
    InsideArray extends true | false,
    AllowConstant extends true | false
> = {
    [Property in keyof Target]:
        | ([AllowConstant] extends [true] ? Target[Property] : never)
        | ([Target[Property]] extends [
              ArrayWithLength<infer ArrayType, infer ArrayLength>
          ]
              ? [ArrayType] extends [Record<string | number | symbol, any>]
                  ? [
                        (
                            | ArrayParseEntry<ArrayType, ArrayType, any>
                            | RecursiveParseStructure<ArrayType, true, false>
                        ),
                        ArraySettings<ArrayLength>
                    ]
                  : [
                        ArrayParseEntry<ArrayType, ArrayType, any>,
                        ArraySettings<ArrayLength>
                    ]
              : [Target[Property]] extends [Record<string, any>]
              ?
                    | ParseEntry<Target, Property, any, InsideArray>
                    | RecursiveParseStructure<
                          Target[Property],
                          InsideArray,
                          true // TODO: Check if this might cause errors
                      >
              : ParseEntry<Target, Property, any, InsideArray>);
};

export type NotFinishedResult<
    Target extends Record<string | number | symbol, any>
> = {
    [Property in keyof Target]?:
        | undefined
        | Target[Property]
        | ([Target[Property]] extends [null]
              ? UnresolvedDependency<Target, Target[Property]>
              : undefined)
        | NotFinishedResult<Target[Property]>;
};
