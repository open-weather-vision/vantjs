export type Pipeline<
    S,
    R,
    InsideArray extends true | false
> = InsideArray extends true
    ?
          | [
                (val: S, index: number) => any,
                ...Array<(val: any, index: number) => any>,
                (val: any, index: number) => R
            ]
          | [(val: S, index: number) => any, (val: any, index: number) => R]
          | [(val: S, index: number) => R]
    :
          | [(val: S) => any, ...Array<(val: any) => any>, (val: any) => R]
          | [(val: S) => any, (val: any) => R]
          | [(val: S) => R];
