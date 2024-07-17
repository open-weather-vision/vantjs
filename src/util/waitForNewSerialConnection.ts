import { PortInfo } from "@serialport/bindings-interface";
import { SerialPort } from "serialport";

function extractPaths(list: PortInfo[]) {
    return list.map((entry) => entry.path);
}

function getNewPath(oldPaths: string[], newPaths: string[]) {
    for (const path of newPaths) {
        if (!oldPaths.includes(path)) {
            return path;
        }
    }
}

/**
 * This methods waits for a new serial connection (until a timeout occurs).
 * @param timeout time to wait in seconds
 * @returns the serial path of the connected device
 */
export default function waitForNewSerialConnection(
    timeout?: number
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        function checkPortsRepeatedly(oldPaths: string[]) {
            const interval = setInterval(async () => {
                const newPaths = extractPaths(await SerialPort.list());
                const path = getNewPath(oldPaths, newPaths);
                if (path) {
                    clearInterval(interval);
                    setTimeout(() => {
                        resolve(path);
                    }, 200);
                }else{
                    oldPaths = newPaths;
                }
            }, 50);

            if(timeout) {
                setTimeout(() => {
                    clearInterval(interval);
                    reject("Timeout!");
                }, timeout) 
            }
        }
        SerialPort.list().then((ports) => checkPortsRepeatedly(extractPaths(ports)));
    });
}
