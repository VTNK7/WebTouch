import axios from "axios";

export default class Constants {

    MAIN_URL = "https://proxyconnection.touch.dofus.com";

    HAAPI_URL = "https://haapi.ankama.com/json/Ankama/v5/";

    // config : https://proxyconnection.touch.dofus.com/config.json
    config;

    async setConfig() {
        this.config = await axios.get(`${this.MAIN_URL}/config.json`)
            .then((response) => response.data)
            .catch((error) => console.log("Error in config loading ! (" + error.message + ")"));
    }
}

