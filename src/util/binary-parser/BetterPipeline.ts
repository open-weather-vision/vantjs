import flow from "lodash.flow";

export function Pipeline<S, R1, R2, R3, R4, R5, R6, E>(
    f1: (val: S) => R1,
    f2: (val: R1) => R2,
    f3: (val: R2) => R3,
    f4: (val: R3) => R4,
    f5: (val: R4) => R5,
    f6: (val: R5) => R6,
    f7: (val: R6) => E
): (val: S) => E;

export function Pipeline<S, R1, R2, R3, R4, R5, E>(
    f1: (val: S) => R1,
    f2: (val: R1) => R2,
    f3: (val: R2) => R3,
    f4: (val: R3) => R4,
    f5: (val: R4) => R5,
    f6: (val: R5) => E
): (val: S) => E;

export function Pipeline<S, R1, R2, R3, R4, E>(
    f1: (val: S) => R1,
    f2: (val: R1) => R2,
    f3: (val: R2) => R3,
    f4: (val: R3) => R4,
    f5: (val: R4) => E
): (val: S) => E;

export function Pipeline<S, R1, R2, R3, E>(
    f1: (val: S) => R1,
    f2: (val: R1) => R2,
    f3: (val: R2) => R3,
    f4: (val: R3) => E
): (val: S) => E;

export function Pipeline<S, R1, R2, E>(
    f1: (val: S) => R1,
    f2: (val: R1) => R2,
    f3: (val: R2) => E
): (val: S) => E;

export function Pipeline<S, R1, E>(
    f1: (val: S) => R1,
    f2: (val: R1) => E
): (val: S) => E;

export function Pipeline<S, E>(f1: (val: S) => E): (val: S) => E;

export function Pipeline(...func: Array<(val: any) => any>): (val: any) => any {
    return flow(func);
}

export function ArrayPipeline<S, R1, R2, R3, R4, R5, R6, E>(
    f1: (val: S, index: number) => R1,
    f2: (val: R1, index: number) => R2,
    f3: (val: R2, index: number) => R3,
    f4: (val: R3, index: number) => R4,
    f5: (val: R4, index: number) => R5,
    f6: (val: R5, index: number) => R6,
    f7: (val: R6, index: number) => E
): (val: S, index: number) => E;

export function ArrayPipeline<S, R1, R2, R3, R4, R5, E>(
    f1: (val: S, index: number) => R1,
    f2: (val: R1, index: number) => R2,
    f3: (val: R2, index: number) => R3,
    f4: (val: R3, index: number) => R4,
    f5: (val: R4, index: number) => R5,
    f6: (val: R5, index: number) => E
): (val: S, index: number) => E;

export function ArrayPipeline<S, R1, R2, R3, R4, E>(
    f1: (val: S, index: number) => R1,
    f2: (val: R1, index: number) => R2,
    f3: (val: R2, index: number) => R3,
    f4: (val: R3, index: number) => R4,
    f5: (val: R4, index: number) => E
): (val: S) => E;

export function ArrayPipeline<S, R1, R2, R3, E>(
    f1: (val: S, index: number) => R1,
    f2: (val: R1, index: number) => R2,
    f3: (val: R2, index: number) => R3,
    f4: (val: R3, index: number) => E
): (val: S) => E;

export function ArrayPipeline<S, R1, R2, E>(
    f1: (val: S, index: number) => R1,
    f2: (val: R1, index: number) => R2,
    f3: (val: R2, index: number) => E
): (val: S, index: number) => E;

export function ArrayPipeline<S, R1, E>(
    f1: (val: S, index: number) => R1,
    f2: (val: R1, index: number) => E
): (val: S, index: number) => E;

export function ArrayPipeline<S, E>(
    f1: (val: S, index: number) => E
): (val: S, index: number) => E;

export function ArrayPipeline(
    ...func: Array<(val: any, index: number) => any>
): (val: any, index: number) => any {
    return flow(func);
}

export type TransformFunction<S, E, InsideArray extends true | false> = [
    InsideArray
] extends [false]
    ? (val: S) => E
    : (val: S, index: number) => E;
