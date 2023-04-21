import idFrame from "./idFrame.js";
import Dispatcher from "./Dispatcher.js";

export default class Frames {
    static dispatcher = new Dispatcher();

    static frames = [
        new idFrame(),
    ];

    static init() {
        for (const f of this.frames) {
            f.register();
        }
    }
}
