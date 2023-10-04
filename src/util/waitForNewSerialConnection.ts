import { PortInfo } from "@serialport/bindings-interface";
import { SerialPort } from "serialport";

function extractPaths(list: PortInfo[]) {
    const paths = [];
    for (const entry of list) {
        paths.push(entry.path);
    }
    return paths;
}

function getNewPath(oldPaths: string[], newPaths: string[]) {
    for (const path of newPaths) {
        if (!oldPaths.includes(path)) {
            return path;
        }
    }
}

export default function waitForNewSerialConnection(
    timeout: number
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let waitingTime = 0;
        function checkPorts(oldPaths: string[]) {
            setTimeout(async () => {
                waitingTime += 50;
                const newPaths = extractPaths(await SerialPort.list());
                if (newPaths.length > oldPaths.length) {
                    const path = getNewPath(oldPaths, newPaths);
                    if (!path) reject("Unknown error!");
                    else resolve(path);
                }
                if (waitingTime < timeout * 1000) {
                    checkPorts(oldPaths);
                } else {
                    reject("Timeout!");
                }
            }, 50);
        }
        SerialPort.list().then((ports) => checkPorts(extractPaths(ports)));
    });
}
