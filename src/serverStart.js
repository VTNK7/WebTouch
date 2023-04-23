import { WebSocketServer } from 'ws';
import Account from './account.js';
import Constants from './Constants.js';
import dotenv from 'dotenv';

dotenv.config();
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



async function start() {
    if (!process.env.PSEUDO || !process.env.PASSWORD) {
        console.log('Please set PSEUDO and PASSWORD environment variables. (.env file)');
        process.exit(1);
    }
    var account = new Account(process.env.PSEUDO, process.env.PASSWORD);
    await Constants.init();
    account.start();

}

start();

