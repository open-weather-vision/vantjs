import deepForEach from "deep-for-each";

deepForEach([23, 21], (value, key, subject, path) => {
    // `value` is the current property value
    // `key` is the current property name
    // `subject` is either an array or an object
    // `path` is the iteration path, e.g.: 'prop2[0]' and 'prop4.prop5'

    console.log(`${path}:`, value);
});
