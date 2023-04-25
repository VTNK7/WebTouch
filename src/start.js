import Account from './account.js';
import Constants from './Constants.js';
import dotenv from 'dotenv';
dotenv.config();


const specific = "script";
const args = {
    "path": "test.lua"
}

var account;
export async function start() {
    if (!process.env.PSEUDO || !process.env.PASSWORD) {
        console.log('Please set PSEUDO and PASSWORD environment variables. (.env file)');
        process.exit(1);
    }
    account = new Account(process.env.PSEUDO, process.env.PASSWORD);
    await Constants.init();
    await account.start() 

    // Il faudra faire en sorte que le script soit lancé après la connexion
    account.instructionController.RunSpecific(specific, args);

}

export function getAccount() {
    return account;
}


start();

