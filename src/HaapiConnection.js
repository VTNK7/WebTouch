import Constants from './Constants.js';
export default class HaapiConnection {
    haapi;
    token;
    account;

    constructor({ account }) {
        this.account = account;
    }

    async processHaapi(pseudo, password) {
        this.haapi = await this.createApiKey(pseudo, password);
        this.token = await this.getToken();
    };
    async createApiKey(pseudo, password) {
        return fetch("https://haapi.ankama.com/json/Ankama/v5/Api/CreateApiKey", {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US",
                "content-type": "text/plain;charset=UTF-8"
            },
            "referrer": "http://localhost:3000/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": `game_id=18&long_life_token=false&login=vikooo.tiktok%2B1%40gmail.com&password=cC8%2F4Ec34(z%3BeF`,
            "method": "POST",
            "mode": "cors",
            "credentials": "omit"
        }).then(response => response.json())
            .then(data => data)
            .catch((error) => console.log("Error in apikey loading ! (" + error.message + ")"));
    }

    async getToken() {
        return fetch(`${Constants.HAAPI_URL}Account/CreateToken?game=18`, {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US",
                "apikey": this.haapi.key,
            },
            "referrer": "http://localhost:3000/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        }).then((response) => response.json())
            .then(data => data.token);
    }
}