import axios from "axios";
import primusClient from 'primus-client';
import Primus from 'primus-client';
import HaapiConnection from './HaapiConnection.js';
import Constants from './Constants.js';

async function start() {

    const ab = await getConfig();
    console.log(ab);
}

async function assetVersion() {
    return await axios.get(`https://proxyconnection.touch.dofus.com/assetsVersions.json`)
        .then((response) => response.data)
        .catch((error) => console.log("Error in config loading ! (" + error.message + ")"));
}
async function getConfig() {
    const response = await axios.get(`https://proxyconnection.touch.dofus.com/config.json`)
        .then((response) => response.data)
        .catch((error) => console.log("Error in config loading ! (" + error.message + ")"));
    return response;
}
async function getAppVersion(){
    const response = await axios.get("https://itunes.apple.com/lookup", {
      params: {
        country: "fr",
        id: 1041406978,
        lang: "fr",
        limit: 1,
        t: Date.now()
      }
    });
    return response.data.results[0].version;
  }

async function getBuildVersion() {
    const response = await axios.get(`https://proxyconnection.touch.dofus.com/build/script.js`);
    const regex = /.*buildVersion=("|')([0-9]*\.[0-9]*\.[0-9]*)("|')/g;
const m = regex.exec(response.data.substring(1, 10000));
return m[2];
  }

start();