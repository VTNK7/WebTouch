import axios from "axios";

export default class Constants {

    static MAIN_URL = "https://proxyconnection.touch.dofus.com";

    static HAAPI_URL = "https://haapi.ankama.com/json/Ankama/v5/";

    // config : https://proxyconnection.touch.dofus.com/config.json
    static config;
    static assetsVersion;
    static staticDataVersion;
    static appVersion;
    static buildVersion;

    static async init() {
        
        this.config = await Constants.getConfig();
        const m = await Constants.getAssetVersion();
        this.assetsVersion = m.assetsVersion;
        this.staticDataVersion = m.staticDataVersion;
        this.appVersion = await Constants.getAppVersion();
        this.buildVersion = await Constants.getBuildVersion();
    }

    static async getConfig() {
        const response = await axios.get(`https://proxyconnection.touch.dofus.com/config.json`)
            .then((response) => response.data)
            .catch((error) => console.log("Error in config loading ! (" + error.message + ")"));
        return response;
    }

    static async getAssetVersion() {
        const response = await axios.get(`https://proxyconnection.touch.dofus.com/assetsVersions.json`)
            .then((response) => response.data)
            .catch((error) => console.log("Error in config loading ! (" + error.message + ")"));
        return response;
    }

    static async getAppVersion() {
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

    static async getBuildVersion() {
        const response = await axios.get(`https://proxyconnection.touch.dofus.com/build/script.js`);
        const regex = /.*buildVersion=("|')([0-9]*\.[0-9]*\.[0-9]*)("|')/g;
    const m = regex.exec(response.data.substring(1, 10000));
    return m[2];
      }

}

