'use strict';

let WebSocket = require('ws');

function Message(type, data) {
    this.type = type;
    this.data = data;
    this.toString = function () {
        return JSON.stringify(this);
    };
}

let hrstart;

let numberOfConnection = 25000;
let numberOfResponse = 0;
let numberOfEstablishedConnections = 0;
let ipPort = process.argv[2] || '127.0.0.1:1337';

let numberBenchReadyConnection = 0;
let benchReadyConnection = [];

function startBenchmark() {
    hrstart = process.hrtime();
    benchReadyConnection.forEach(ws => {
        ws.send(new Message('benchmark', {}).toString());
    });
}

function onMessage(ws) {
    return message => {
        message = JSON.parse(message);
        if (message.type === 'benchmark-ready') {
            numberBenchReadyConnection++;
            benchReadyConnection.push(ws);
            if (numberBenchReadyConnection === numberOfConnection) {
                startBenchmark();
            }
        } else {
            numberOfResponse++;
            console.log(message.type + numberOfResponse);
            if (numberOfResponse === numberOfConnection) {
                var hrend = process.hrtime(hrstart);
                console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
                numberOfResponse = 0;
                startBenchmark();
            }
        }
    };
}

let openWebSockets = [];
let numberOfOpenConnections = 0;

function onOpen(ws) {
    return function () {
        numberOfOpenConnections++;
        openWebSockets.push(ws);
        if (numberOfOpenConnections === numberOfConnection) {
            openWebSockets.forEach(openWebSocket => {
                openWebSocket.send(new Message('service-request', {}).toString());
            });
        }
    };
}

for (let i = 0; i < numberOfConnection; i++) {
    try {
        let ws = new WebSocket(`ws://${ipPort}/?userToken=test`);
        ws.on('open', onOpen(ws));
        ws.on('message', onMessage(ws));

    } catch (e) {
        console.log(e);
    }
}

process.on('uncaughtException', (e) => {
    console.log(e);
});


console.log(process.pid);