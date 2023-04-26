import Primus from 'primus-client';
import HaapiConnection from './HaapiConnection.js';
import Constants from './Constants.js';
import HandleResponse from './HandleResponse.js';
import { sendClient } from './server.js';
import InstructionController from './instructions/InstructionController.js';
import PlayerData from './data/PlayerData.js';

export default class Account {
    haapi;
    socket;
    pseudo;
    password;
    responseHandler;
    ticket;
    serverAdress;
    serverId = 401;
    serverPort;
    instructionController;
    playerData;

    constructor(pseudo, password) {
        this.pseudo = pseudo;
        this.password = password;
        this.instructionController = new InstructionController({ account: this });
        this.playerData = new PlayerData();
        this.responseHandler = new HandleResponse({ account: this });

    }

    async start() {
        if (!Constants.config) {
            console.log("Error in config loading ! (config is null)");
            return;
        }
        this.haapi = new HaapiConnection({ account: this });
        this.haapi.processHaapi(this.pseudo, this.password);
        await this.connect(Constants.config.sessionId, Constants.config.dataUrl);

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

    async FirstSocket() {
        await this.haapi.token;
        console.log("Starting first socket operations")
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
        console.log("Starting second socket operations")

        this.CommonSocket();
        
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
                appVersion: Constants.appVersion,
                buildVersion: Constants.buildVersion,
            }
            );
        });

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

            else if (data._messageType === "CharacterSelectedSuccessMessage") {
                this.send("moneyGoultinesAmountRequest", {});
                this.send("sendMessage", {"type":"QuestListRequestMessage"});
                this.send("sendMessage", {"type":"FriendsGetListMessage"});
                this.send("sendMessage", {"type":"IgnoredGetListMessage"});
                this.send("sendMessage", {"type":"SpouseGetInformationsMessage"});
                this.send("setShopDetailsRequest", {});
                this.send("sendMessage", {"type":"OfflineOptionsUpdateRequestMessage","data":{"options":"1,0,NON+PAN+PVN"}});
                this.send("bakSoftToHardCurrentRateRequest", {});
                this.send("bakHardToSoftCurrentRateRequest", {});
                this.send("restoreMysteryBox", {});
                this.send("sendMessage", {"type":"ClientKeyMessage","data":{"key":"Arndc8wv9gauD1kIJQ33D"}});
                this.send("sendMessage", {"type":"GameContextCreateRequestMessage"});
            }

            else if (data._messageType === "SequenceNumberRequestMessage") {
                this.send("sendMessage", {"type":"SequenceNumberMessage","data":{"number":1}});
            }
            
            else if (data._messageType === "setShopDetailsSuccess") {
                this.send("shopHighLightsListRequest", {"type":"POPUP"});
            }
            else if (data._messageType === "GameContextCreateMessage") {
                this.send("sendMessage", {"type":"ObjectAveragePricesGetMessage"});
            }
            else if (data._messageType === "CurrentMapMessage") {
                this.send("sendMessage", {"type":"MapInformationsRequestMessage","data":{"mapId":150328}});
            }

            else {
                sendClient(data);
                this.responseHandler.handle(data);
            }
        });

    }

    async connect(sessionId, url) {
        const currentUrl = this.makeSticky(url, sessionId);
        this.socket = this.createSocket(currentUrl);
        await this.FirstSocket(); // will open second socket on finish
        this.socket.open();
    }

    makeSticky(url, sessionId) {
        const seperator = url.indexOf("?") === -1 ? "?" : "&";
        return url + seperator + "STICKER" + "=" + encodeURIComponent(sessionId);
    }

    createSocket(url) {
        console.log("\nPrimus connect socket url : (" + url + ") ...");
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
            console.log('Connection ended' );
        });

        this.socket.on("close", () => {
            console.log('Connection closed' );
        });

        this.socket.on("destroy", () => {
            console.log('Connection destroyed');
        });
    }
}