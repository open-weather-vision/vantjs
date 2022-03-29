export default function <T>(target: T, source: any) {
    for (const propertyName in target) {
        if (propertyName in source) {
            target[propertyName] = source[propertyName];
        }
    }
    return target as T;
}
