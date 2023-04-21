
import primusClient from 'primus-client';
import Primus from 'primus-client';
import HaapiConnection from './HaapiConnection.js';
import Constants from './Constants.js';


export default class Account {
    haapi;
    socket;
    pseudo;
    password;

    constructor(pseudo, password) {
        this.pseudo = pseudo;
        this.password = password;
        // this.constants = new Constants();

    }

    async start() {

        if (!Constants.config) {
            console.log("Error in config loading ! (config is null)");
            return;
        }

        this.haapi = new HaapiConnection({ account: this });
        this.haapi.processHaapi(this.pseudo, this.password);
        this.connect(Constants.config.sessionId, Constants.config.dataUrl);
        this.connect(Constants.config.sessionId, Constants.config.dataUrl);
        // wss://north-virginiagameproxy.touch.dofus.com/primus?STICKER=ILiUydR7Z4Lnn/uf&_primuscb=OUXHNlQ
    }

    send(call, data) {
        let msg;
        let msgName;
        if (call === "sendMessage") {
            msgName = data.type;
            msg = data.data ? { call, data } : { call, data: { type: data.type } };
        } else {
            msgName = call;
            msg = data ? { call, data } : { call };
        }
        console.log("Sending", msg);
        // this.onMessageSent.trigger({ type: msgName, data });
        // Frames.dispatcher.emit(msgName, this.account, data);
        this.socket.write(msg);
    }


    setCurrentConnection() {
        this.socket.on("open", () => {
            this.send("connecting", {
                appVersion: Constants.appVersion,
                buildVersion: Constants.buildVersion,
                client: "android",
                language: "fr",
                server: "login"
            });
        });

        this.socket.on("data", (data) => {
            console.log("Received", data);

            if (data._messageType === "HelloConnectMessage") {
                const key = data.key;
                const salt = data.salt;
                this.send("login", {
                    key: key,
                    salt: salt,
                    token: this.haapi.token,
                    username: this.pseudo
                });
            }   else return

            if (data._messageType === "ServersListMessage") {
                console.log("BIENRECU");
                this.send("sendMessage", {

                    "type": "ServerSelectionMessage",
                    "data": {
                        "serverId": 401
                    }

                });
            } else return
            var url1;
            console.log("data", data._access)
            if (data._messageType === "SelectedServerDataMessage") {
                url1 = data._access;

                this.send("disconnecting", {

                    data: "SWITCHING_TO_GAME"

                });
            }else return
            // NOUVELLE SOCKET

            this.socket.destroy();
            console.log("url1", url1);
            const currentUrl = this.makeSticky(url1, Constants.config.sessionId);
            this.socket = this.createSocket(currentUrl);
            this.setCurrentConnection();
            this.socket.open();

        });

        this.socket.on("error", (err) => {
            console.log('Erreur : ' + err.message);
        });

        this.socket.on("reconnect", (opts) => {
            console.log('Reconnecting');
        });

        this.socket.on("reconnect scheduled", (opts) => {
            console.log('Reconnection scheduled');
        });

        this.socket.on("reconnected", (opts) => {
            console.log('Reconnected');
        });

        this.socket.on("reconnect timeout", (err, opts) => {
            console.log('Reconnection timeout');
        });

        this.socket.on("reconnect failed", (err, opts) => {
            console.log('Reconnection failed');
        });

        this.socket.on("timeout", () => {
            console.log('Connection timeout');
        });

        this.socket.on("online", () => {
            console.log('Connection online');
        });

        this.socket.on("readyStateChange", (state) => {
            console.log('Connection readyStateChange');
        });

        this.socket.on("offline", () => {
            console.log('Connection offline');
        });

        this.socket.on("end", () => {
            console.log('Connection ended');
        });

        this.socket.on("close", () => {
            console.log('Connection closed');
        });

        this.socket.on("destroy", () => {
            console.log('Connection destroyed');
        });
    }

    connect(sessionId, url) {
        const currentUrl = this.makeSticky(url, sessionId);
        console.log("Primus", "Connecting to login server (" + currentUrl + ") ...");
        this.socket = this.createSocket(currentUrl);
        this.setCurrentConnection();
        this.socket.open();
    }

    makeSticky(url, sessionId) {
        const seperator = url.indexOf("?") === -1 ? "?" : "&";
        return url + seperator + "STICKER" + "=" + encodeURIComponent(sessionId);
    }

    createSocket(url) {
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