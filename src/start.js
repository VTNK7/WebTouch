import Account from './account.js';
import Constants from './Constants.js';
import dotenv from 'dotenv';
dotenv.config();

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

