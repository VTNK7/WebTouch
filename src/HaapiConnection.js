import axios from "axios";

export default class HaapiConnection {
    haapi;
    token;
    account;

    constructor({ account }) {
        this.account = account;
    }


    async processHaapi(username, password) {
        this.haapi = await this.createApiKey(username, password);
        this.token = await this.getToken();
    };

    async createApiKey(username, password) {
        return await axios.post(`${this.account.constants.HAAPI_URL}/Api/CreateApiKey`,
            "login=" + username + "&password=" + password + "&long_life_token=false")
            .then((response) => response.data)
            .catch((error) => console.log("Error in apikey loading ! (" + error.message + ")"));
    }

    async getToken() {
        const config = {
            params: {
                game: this.account.constants.config.haapi.id,
            },
            headers: {
                apikey: this.haapi.key,
            },
        };
        return await axios.get(`${this.account.constants.HAAPI_URL}/Account/CreateToken`, config)
            .then((response) => response.data.token)
            .catch((error) => console.log("Error in getToken loading ! (" + error.message + ")"));
    }
}