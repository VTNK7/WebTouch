

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
            case "CurrentMapMessage":
                this.handleCurrentMapMessage(data);
                break;
  
            default:
        }
    }

    handleCurrentMapMessage(data) {
        console.log("CurrentMapMessage received : " + data.mapId)
        this.account.playerData.mapId = data.mapId;
    }

    handleObjectAveragePricesMessage(data) {
        console.log("ObjectAveragePricesMessage received : ");
    }


}