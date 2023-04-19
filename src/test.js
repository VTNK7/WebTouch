import axios from "axios";
import primusClient from 'primus-client';
import Primus from 'primus-client';
import HaapiConnection from './HaapiConnection.js';
import Constants from './Constants.js';

async function start() {
    const av = await assetVersion();
    console.log(av);
    console.log(av.assetsVersion);
    const ak = await createApiKey();
    console.log(ak);
}

async function createApiKey() {
    return await axios.post(`https://haapi.ankama.com/json/Ankama/v5/Api/CreateApiKey`,"game_id=18&long_life_token=false&login=vikooo.tiktok%2B1%40gmail.com&password=cC8%2F4Ec34(z%3BeF")
        .then((response) => response.data)
        .catch((error) => console.log("Error in apikey loading ! (" + error.message + ")"));
}

async function assetVersion() {
    return await axios.get(`https://proxyconnection.touch.dofus.com/assetsVersions.json`)
        .then((response) => response.data)
        .catch((error) => console.log("Error in config loading ! (" + error.message + ")"));
}

start();