import deepForEach from "deep-for-each";
import inspect from "../inspect";
import { UnresolvedDependency } from "./parse";

const a = {
    test: [23, 1, 1],
    nested: {
        a: new UnresolvedDependency({
            nullWith: "b",
            resolvedValue: 23,
        }),
        b: null,
        c: new UnresolvedDependency({
            nullWith: "a",
            resolvedValue: 32,
        }),
    },
};

deepForEach(a, (val, key, subject) => {
    if (val instanceof UnresolvedDependency) {
        let dependency = subject[val.nullWith];
        const dependencyGroup = [key, val.nullWith];
        while (true) {
            if (dependency === null) {
                dependencyGroup.pop();
                for (const key of dependencyGroup) {
                    subject[key] = null;
                }
                break;
            } else if (dependency instanceof UnresolvedDependency) {
                if (dependency.nullWith === key) {
                    for (const key of dependencyGroup) {
                        subject[key] = subject[key].resolvedValue;
                    }
                    break;
                }
                dependencyGroup.push(dependency.nullWith);
                dependency = subject[dependency.nullWith];
            } else {
                dependencyGroup.pop();
                for (const key of dependencyGroup) {
                    subject[key] = subject[key].resolvedValue;
                }
                break;
            }
        }
    }
});

inspect(a);
