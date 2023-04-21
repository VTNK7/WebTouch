export default class Dispatcher {
    prefix;
    listeners;

    constructor() {
        this.prefix = "on_";
        this.listeners = {};
    }

    register(eventName, callback, bind) {
        const newEventName = this.prefix + eventName;
        if (typeof this.listeners[newEventName] === "undefined") {
            this.listeners[newEventName] = [];
        }
        this.listeners[newEventName].push([bind === null ? this : bind, callback]);
    }

    emit(eventName, ...params) {
        const newEventName = this.prefix + eventName;
        if (typeof this.listeners[newEventName] !== "undefined") {
            for (let i = 0, l = this.listeners[newEventName].length; i < l; i++) {
                this.listeners[newEventName][i][1].call(
                    this.listeners[newEventName][i][0],
                    ...params
                );
            }
        }
    }
}
