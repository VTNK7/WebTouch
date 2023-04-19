import Account from './account.js';

import dotenv from 'dotenv';
dotenv.config();

function start() {
    console.log('HELLO');
    if (!process.env.USERNAME || !process.env.PASSWORD) {
        console.log('Please set USERNAME and PASSWORD environment variables. (.env file)');
        process.exit(1);
    }
    var account = new Account(process.env.USERNAME, process.env.PASSWORD);
    account.start();
}

start();