import { SerialPort, SerialPortOpenOptions } from "serialport";
import { ClosedConnectionError, SerialPortError } from "../errors/index.js";
import { TypedEmitter } from "tiny-typed-emitter";

export interface SerialPortEvents{
    "disconnect": () => void,
    "connect": () => void,
};

export default class BetterSerialPort extends TypedEmitter<SerialPortEvents>{
    port: SerialPort;
    connectionState: "connected" | "disconnected" = "disconnected";

    constructor(options: {
        path: string,
        baudRate: number,
    }){
        super();
        this.port = new SerialPort({
            ...options,
            autoOpen: false
        });

        this.port.on("close", () => {
            this.connectionState = "disconnected";
            this.emit("disconnect");
        });
    }

    open(){
        return new Promise<void>((resolve, reject) => {
            const listeners: any = {};

            listeners["error"] = (err: any) => {
                for(const key in listeners){
                    this.port.removeListener(key, listeners[key]);
                }
                reject(new SerialPortError(err));
            };

            listeners["close"] = () => {
                for(const key in listeners){
                    this.port.removeListener(key, listeners[key]);
                }
                reject(new ClosedConnectionError());
            };
            
            this.port.once("error", listeners["error"]);
            this.port.once("close", listeners["close"]);

            if(this.connectionState === "connected"){
                resolve();
            } else{
                this.port.open((err) => {
                    for(const key in listeners){
                        this.port.removeListener(key, listeners[key]);
                    }
                    if(err){
                        reject(new SerialPortError(err));
                    }else{
                        this.connectionState = "connected";
                        this.emit("connect");
                        resolve();
                    }
                });
            }
        });
    }

    close(){
        return new Promise<void>((resolve, reject) => {
            const listeners: any = {};

            listeners["error"] = (err: any) => {
                for(const key in listeners){
                    this.port.removeListener(key, listeners[key]);
                }
                reject(new SerialPortError(err));
            };

            listeners["close"] = () => {
                for(const key in listeners){
                    this.port.removeListener(key, listeners[key]);
                }
                resolve();
            };

            this.port.once("error", listeners["error"]);
            this.port.once("close", listeners["close"]);

            if(this.connectionState === "disconnected"){
                for(const key in listeners){
                    this.port.removeListener(key, listeners[key]);
                }
                resolve();
            }else{
                this.port.close((err) => {
                    for(const key in listeners){
                        this.port.removeListener(key, listeners[key]);
                    }
                    if(err) reject(new SerialPortError(err));
                    this.connectionState = "disconnected";
                    resolve();
                })
            }
        });
    }

    waitForData(length: number, timeout?: number): Promise<Buffer>{
        return new Promise((resolve, reject) => {
            const listeners = this.registerErrorListeners(resolve, reject);

            let buffer = Buffer.alloc(0);
            listeners["data"] = (data: Buffer) => {
                buffer = Buffer.concat([buffer, data]);
                
                if (buffer.byteLength >= length) {
                    for(const key in listeners){
                        this.port.removeListener(key, listeners[key]);
                    }
                    resolve(buffer);
                }
            }
            
            this.port.on("data", listeners["data"]);
        });
    }

    private registerErrorListeners(resolve: any, reject: any){
        const listeners: any = { "close": null, "error": null }

        listeners["error"] = (err: any) => {
            for(const key in listeners){
                this.port.removeListener(key, listeners[key]);
            }
            reject(new SerialPortError(err));
        };

        listeners["close"] = () => {
            for(const key in listeners){
                this.port.removeListener(key, listeners[key]);
            }
            reject(new ClosedConnectionError());
        };

        if(this.connectionState === "disconnected"){
            reject(new ClosedConnectionError());
        }
        this.port.once("close", listeners["close"]);
        this.port.once("error", listeners["error"]);

        return listeners;
    }

    write(buffer: Buffer): Promise<void>{
        return new Promise((resolve, reject) => {
            const listeners = this.registerErrorListeners(resolve, reject);
            this.port.write(buffer, undefined, (err) => {
                for(const key in listeners){
                    this.port.removeListener(key, listeners[key]);
                }
                if(err){
                    reject(new SerialPortError(err));
                }else{
                    resolve();
                }
            });
        });
    }
}