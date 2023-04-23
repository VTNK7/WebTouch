import Account from './account.js';
import Constants from './Constants.js';
import dotenv from 'dotenv';
import readline from 'readline';
dotenv.config();
var account;
export async function start() {
    if (!process.env.PSEUDO || !process.env.PASSWORD) {
        console.log('Please set PSEUDO and PASSWORD environment variables. (.env file)');
        process.exit(1);
    }
    account = new Account(process.env.PSEUDO, process.env.PASSWORD);
    await Constants.init();
    account.start() // Affiche 'Terminé!'

    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });

    // rl.question('Entrez votre nom: ', (nom) => {
    //     console.log(`Bonjour, ${nom}!`);
    //     rl.close();
    // });


}

export function getAccount() {
    return account;
}


start();

