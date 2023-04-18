
import primusClient from 'primus-client';
import Primus from 'primus-client';
import HaapiConnection from './HaapiConnection.js';
import Constants from './Constants.js';


export default class Account {
    haapi;
    socket;
    username;
    password;
    constants;


    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.constants = new Constants();
    }

    async start() {
        await this.constants.setConfig();
        if (!this.constants.config) {
            console.log("Error in config loading ! (config is null)");
            return;
        }


        this.haapi = new HaapiConnection({ account: this });
        this.haapi.processHaapi(this.username, this.password);
        this.connect(this.constants.config.sessionId, this.constants.config.dataUrl);
    }

    connect(sessionId, url) {
        const currentUrl = this.makeSticky(url, sessionId);
        console.log("Primus", "Connecting to login server (" + currentUrl + ") ...");
        this.socket = this.createSocket(currentUrl);
        this.socket.open();
    }

    makeSticky(url, sessionId) {
        const seperator = url.indexOf("?") === -1 ? "?" : "&";
        return url + seperator + "STICKER" + "=" + encodeURIComponent(sessionId);
    }

    createSocket(url) {
        console.log("Creation du socket");
        return new Primus(url, {
            manual: true,
            reconnect: {
                max: Infinity,
                min: 500,
                retries: 10,
            },
            strategy: "disconnect,timeout",
            transformer: "engine.io",
        });

    } 

}