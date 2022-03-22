import { EventEmitter } from "events";

class TestEventEmitter extends EventEmitter {
    constructor() {
        super();
        setInterval(() => {
            this.emit("lol");
        }, 5000);
    }
}

const test = new TestEventEmitter();

for (let i = 0; i < 12; i++) {
    test.once("lol", () => {
        console.log("got called!: " + test.listenerCount("lol"));
    });
    console.log(test.listenerCount("lol"));
}
