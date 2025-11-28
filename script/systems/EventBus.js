// script/system/EventBus.js
export default class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(name, cb) {
        if (!this.listeners[name]) this.listeners[name] = [];
        this.listeners[name].push(cb);
        return () => this.off(name, cb);
    }

    off(name, cb) {
        if (!this.listeners[name]) return;
        this.listeners[name] = this.listeners[name].filter(x => x !== cb);
    }

    emit(name, payload) {
        if (!this.listeners[name]) return;
        // copy to avoid mutation during iteration
        const arr = this.listeners[name].slice();
        for (const cb of arr) {
            try { cb(payload); } catch (err) { console.error("EventBus handler error", err); }
        }
    }
}

// export singleton
export const eventBus = new EventBus();
