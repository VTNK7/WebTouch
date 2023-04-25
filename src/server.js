//  A déplacer dans Instruction/InstructionWebServer.js

import { WebSocketServer } from 'ws';
import {start,getAccount} from './start.js';


start();

let client;
var account = getAccount();
var jsonData;


const wss = new WebSocketServer({ port: 8080 });
console.log('Server started on port 8080');
wss.on('connection', function connection(ws) {
    client = ws;
    client.on('ERROR SOCKET', console.error);

    client.on('message', function message(event) {
        //account.send() a rajouter
        jsonData = JSON.parse(JSON.parse(event.toString()));
        console.log("We send" + JSON.stringify(jsonData.call) + "with data : " + JSON.stringify(jsonData.data));
       //account.send(JSON.stringify(jsonData.call),JSON.stringify(jsonData.data))
       account.send(jsonData.call,jsonData.data)
    });
    client.send(JSON.stringify({"Connexion established":true}));
});

function sendClient(data) {
    if (client) {
        client.send(JSON.stringify(data,null,4));
    }
}

export { wss, sendClient };
