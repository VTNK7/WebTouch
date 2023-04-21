

export default class HandleResponse {
    account;
    constructor({ account }) {
        this.account = account;
    }

    async handle(data) {
        switch (data._messageType) {
            case "ObjectAveragePricesMessage":
                this.handleObjectAveragePricesMessage(data);
                break;
            
  
            default:
                console.log("Unhandled message type : ", data._messageType);
        }
    }

    handleObjectAveragePricesMessage(data) {
        console.log("ObjectAveragePricesMessage received : ", data);
    }


}