export default class InstructionScript {
    controller;
    script;

    constructor( controller, path ) {
        this.controller = controller;
        // script : load file at path
    };

    Run() {
        console.log(this.controller.GetItemNameWithId(1000)); 
    };
}
