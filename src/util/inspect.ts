import * as util from "util";

export default function inspect(obj: any): void {
    console.log(util.inspect(obj, false, null, true));
}