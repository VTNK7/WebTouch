import Account from './account.js';

import dotenv from 'dotenv';
dotenv.config();

function start() {
    console.log('HELLO');
    if (!process.env.PSEUDO || !process.env.PASSWORD) {
        console.log('Please set PSEUDO and PASSWORD environment variables. (.env file)');
        process.exit(1);
    }
    var account = new Account(process.env.PSEUDO, process.env.PASSWORD);
    account.start();
}

start();


// var test = fetch("https://haapi.ankama.com/json/Ankama/v5/Api/CreateApiKey", {
//     "headers": {
//         "accept": "application/json",
//         "accept-language": "en-US",
//         "content-type": "text/plain;charset=UTF-8"
//     },
//     "referrer": "http://localhost:3000/",
//     "referrerPolicy": "strict-origin-when-cross-origin",
//     "body": "game_id=18&long_life_token=false&login=vikooo.tiktok%2B1%40gmail.com&password=cC8%2F4Ec34(z%3BeF",
//     "method": "POST",
//     "mode": "cors",
//     "credentials": "omit"
// });

// // print the HTTP response after the fetch is complete
// // test.then(response => console.log(response.json()));

// test.then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.error(error));


