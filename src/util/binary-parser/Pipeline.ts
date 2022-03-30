export type Pipeline<
    S,
    R,
    InsideArray extends true | false
> = InsideArray extends true
    ?
          | [
                (val: S, index: number) => unknown,
                ...Array<(val: unknown, index: number) => unknown>,
                (val: unknown, index: number) => R
            ]
          | [(val: S, index: number) => R]
    :
          | [
                (val: S) => unknown,
                ...Array<(val: unknown) => unknown>,
                (val: unknown) => R
            ]
          | [(val: S) => R];
