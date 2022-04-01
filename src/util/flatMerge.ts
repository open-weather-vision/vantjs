/**
 * Flatly merges the source object into the target object. Properties not being defined in the target object
 * are skipped.
 * @param target
 * @param source
 * @returns
 */
export default function <T>(target: T, source: any) {
    for (const propertyName in target) {
        if (propertyName === "constructor") {
            continue;
        }
        if (propertyName in source) {
            target[propertyName] = source[propertyName];
        }
    }
    return target as T;
}
