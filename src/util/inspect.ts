import * as util from "util";

export default function inspect(obj: any) {
    console.log(util.inspect(obj, false, null, true));
}