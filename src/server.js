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

    client.on('message', function message(data) {
        console.log('SOCKET RECU %s', data);
        //account.send() a rajouter
        jsonData = JSON.parse(data);
        this.send(jsonData.call,jsonData.data)
    });
    client.send('MESSAGE ENVOYE');
});

function sendClient(data) {
    if (client) {
        client.send(data);
    }
}

export { wss, sendClient };
