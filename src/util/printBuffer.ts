import { sprintf } from "sprintf-js";

export default function printBuffer(
    buffer: Buffer,
    divider = "",
    printIndex = false
): void {
    let bufferAsBinaryString = "";
    buffer.forEach((value, index) => {
        const toAppend = sprintf("%8s", value.toString(2)).replace(/ /g, "0");
        if (printIndex) bufferAsBinaryString += `[${index}] `;
        bufferAsBinaryString += toAppend;
        if (index + 1 !== buffer.length) bufferAsBinaryString += divider;
    });
    console.log(bufferAsBinaryString);
}

// const testBuffer = Buffer.alloc(12);
// testBuffer.writeInt16LE(0b1011);
// testBuffer.writeInt16LE(0b1011, 2);
// printBuffer(testBuffer, "\n");
