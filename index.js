'use strict';

let WebSocket = require('ws');

function Message(type, data) {
    this.type = type;
    this.data = data;
    this.toString = function () {
        return JSON.stringify(this);
    };
}

let hrstart = process.hrtime();

let numberOfConnection = 10000;
let numberOfResponse = 0;
let ipPort = process.argv[2] || 'localhost:1337';
for (let i = 0; i < numberOfConnection; i++) {
    try {
        let ws = new WebSocket(`ws://${ipPort}/?userToken=test`);

        ws.on('open', function open() {
            ws.send(new Message('service-request', {}).toString());
        });

        ws.on('message', (message) => {
            console.log(message);
            numberOfResponse++;
            if (numberOfResponse === numberOfConnection) {
                var hrend = process.hrtime(hrstart);
                console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1]/1000000);
            }

        });

    } catch(e) {
        console.log(e);
    }
}

process.on('uncaughtException', (e) => {
    console.log(e);
});
