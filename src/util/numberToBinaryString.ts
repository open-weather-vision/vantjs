import { sprintf } from "sprintf-js";

export default function numberToBinaryString(number: number, bitCount: number): string {
    return sprintf(`%${bitCount}s`, number.toString(2)).replace(/ /g, "0");
}