import Frames from './Frames.js';

export default class idFrame {
  register() {
    Frames.dispatcher.register(
      "HelloConnectMessage",
      this.HandleHelloConnectMessage,
      this
    );
    Frames.dispatcher.register(
      "ProtocolRequired",
      this.HandleprotocolRequired,
      this
    );
  }

  HandleHelloConnectMessage(account, message) {
    console.log("_____HelloConnectMessage", message);
    // console.log("KEY", message.key);
  }

  HandleprotocolRequired(account, message) {
    // Traitement du message "protocolRequired"
    console.log("_____protocolRequired", message);
  }
}

