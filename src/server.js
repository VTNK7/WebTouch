import { WebSocketServer } from 'ws';
import start from './start.js';


start();

let client;

const wss = new WebSocketServer({ port: 8080 });
console.log('Server started on port 8080');
wss.on('connection', function connection(ws) {
    client = ws;
    client.on('ERROR SOCKET', console.error);

    client.on('message', function message(data) {
        console.log('SOCKET RECU %s', data);
    });
    client.send('MESSAGE ENVOYE');
});

function sendClient(data) {
    if (client) {
        client.send(data);
    }
}

export { wss, sendClient };
