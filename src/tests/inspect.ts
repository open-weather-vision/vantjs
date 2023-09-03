import * as util from "util";

/**
 * Deeply inspects the passed object and logs it to the console.
 * @param obj the object to inspect
 */
export default function inspect(obj: any): void {
    console.log(util.inspect(obj, false, null, true));
}
