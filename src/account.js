
import primusClient from 'primus-client';
import Primus from 'primus-client';
import HaapiConnection from './HaapiConnection.js';
import Constants from './Constants.js';
import HandleResponse from './HandleResponse.js';
import fs from 'fs';

export default class Account {
    haapi;
    socket;
    pseudo;
    password;
    responseHandler = new HandleResponse({ account: this });
    ticket;
    serverAdress;
    serverId = 401;
    serverPort;

    constructor(pseudo, password) {
        this.pseudo = pseudo;
        this.password = password;
    }

    async start() {

        if (!Constants.config) {
            console.log("Error in config loading ! (config is null)");
            return;
        }

        this.haapi = new HaapiConnection({ account: this });
        this.haapi.processHaapi(this.pseudo, this.password);
        this.connect(Constants.config.sessionId, Constants.config.dataUrl);
        // console.log(this.GetItemNameWithId(121));
        // console.log(this.GetItemIdWithName("anneau d'agilite"));
        // console.log(this.GetAssetWithId(121));
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
        console.log("Sending : ", msg.call);
        // this.onMessageSent.trigger({ type: msgName, data });
        // Frames.dispatcher.emit(msgName, this.account, data);
        this.socket.write(msg);
    }

    CommonSocket() {

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
            // console.log('Connection readyStateChange');
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

    FirstSocket() {
        console.log("\nStarting first socket operations")
        this.socket.on("open", () => {
            this.send("connecting", {
                appVersion: Constants.appVersion,
                buildVersion: Constants.buildVersion,
                client: "android",
                language: "fr",
                server: "login"
            });
        });

        this.CommonSocket();

        this.socket.on("data", (data) => {
            console.log("Received 1 :", data._messageType);

            if (data._messageType === "HelloConnectMessage") {
                const key = data.key;
                const salt = data.salt;
                this.send("login", {
                    key: key,
                    salt: salt,
                    token: this.haapi.token, //BUG token undefined 
                    username: this.pseudo
                });
            }

            else if (data._messageType === "ServersListMessage") {
                this.send("sendMessage", {
                    type: "ServerSelectionMessage",
                    data: {
                        "serverId": this.serverId
                    }
                });
            }


            else if (data._messageType === "SelectedServerDataMessage") {
                const urlSecondSocket = data._access;
                this.serverAdress = data.address;
                this.serverPort = data.port;
                this.ticket = data.ticket;
                this.send("disconnecting", {
                    data: "SWITCHING_TO_GAME"
                });

                // NOUVELLE SOCKET
                console.log("Nouvelle socket");
                this.socket.destroy();
                const currentUrl = this.makeSticky(urlSecondSocket, Constants.config.sessionId);
                this.socket = this.createSocket(currentUrl);
                this.SecondSocket();
                this.socket.open();
            }
        });
    }

    SecondSocket() {
        console.log("\nStarting second socket operations")

        this.socket.on("open", () => {
            console.log("port : ", this.serverPort, " adress : ", this.serverAdress, " id : ", this.serverId);
            this.send("connecting", {
                "language": "fr",
                "server": {
                    "address": this.serverAdress,
                    "port": this.serverPort,
                    "id": this.serverId
                },
                "client": "android",
                "appVersion": "3.3.7",
                "buildVersion": "1.58.3"
            }
            );
        });

        this.CommonSocket();

        this.socket.on("data", (data) => {
            console.log('Received 2 :', data._messageType);
            if (data._messageType === "ProtocolRequired") {
                // On fait rien
            }

            else if (data._messageType === "HelloGameMessage") {
                this.send("sendMessage", {
                    "type": "AuthenticationTicketMessage",
                    "data": {
                        "ticket": this.ticket,
                        "lang": "fr"
                    }

                });
            }

            else if (data._messageType === "AccountCapabilitiesMessage") {
                this.send("pingSession", {
                    "data": 62755565,
                    // j'ai mis une data au piff jsp a quoi ca sert warning antibot
                });
            }
            else if (data._messageType === "TrustStatusMessage") {
                this.send("sendMessage", {
                    "type": "CharactersListRequestMessage"

                });
            }
            else if (data._messageType === "CharactersListMessage") {
                this.send("sendMessage", {
                    "type": "CharacterSelectionMessage",
                    "data": {
                        "id": 3017884 // selection du perso a rendre modifiable
                    }   
                });
            }

            else {
                this.responseHandler.handle(data);
            }
        });

    }

    connect(sessionId, url) {
        const currentUrl = this.makeSticky(url, sessionId);
        console.log("Primus", "Connecting to login server (" + currentUrl + ") ...");
        this.socket = this.createSocket(currentUrl);
        this.FirstSocket(); // will open second socket on finish
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

    async GetAssetWithId(id) {
        return "not implemented yet";
        var path = `/assets/${this.assetsVersion}/sprites/items/${id}.png`;
        if (fs.existsSync(path)) {
            return path;
        }

        if (!id.toString() in this.items) {
            return null;
        }

        // else download it
        var url = `https://dofustouch.cdn.ankama.com/assets/${this.assetsVersion}_a2hO001Gwuuedc*w00UazwmWzG(EAaNk/gfx/items/${id}.png`;
        // faudra trouver ce que c'est que _a2hO001Gwuuedc*w00UazwmWzG(EAaNk

        await fetch(url)
            .then(response => response.blob())
            .then(blob => {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var contents = event.target.result;
                    fs.writeFile(path, contents, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                };
                reader.readAsDataURL(blob);
            });

        return path;
    }

    GetItemNameWithId(id) {
        return Constants.items[id.toString()];
    }

    GetItemIdWithName(itemName) {
        const item = Object.keys(Constants.items).find(key => Constants.items[key] === itemName);
        if (item) {
            return item;
        }
        // best levenstein distance match
        let bestMatch = null;
        let bestDistance = 9999;

        for (const [key, value] of Object.entries(Constants.items)) {
            const distance = this.Levenstein(value, itemName);
            if (distance < bestDistance) {
                bestMatch = key;
                bestDistance = distance;
            }
        }
        return bestMatch;
    }

    Levenstein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        let matrix = [];

        // increment along the first column of each row
        let i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        let j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    }
}