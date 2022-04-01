declare module "deep-for-each" {
    export default function (
        val: any,
        forEach: (value, key, subject, path) => void
    ): void;
}
