/*
    First Refer to question 
        - 1. eventEmitter
        - 2. oneTimeEmitter
    Instead of having a separate unsubscribe method, modify subscribe so that it returns a cleanup function. Calling that returned function should remove that specific listener.
*/

class PubSub {
    eventStore = {};
    oneEventStore = {};

    isValidEvent(event) {
        return this.eventStore[event] || this.oneEventStore[event];
    }

    callbackQueue(event, callback, shouldFireOnce = false) {
        if(!event || !callback || typeof callback !== 'function') return () => {};
        const queue = shouldFireOnce ? this.oneEventStore : this.eventStore;
        if(!queue[event]) queue[event] = new Set([callback]);
        else queue[event].add(callback);
        return () => {
            if(called) return;
            called = true; // invoke one time
            this.unsubscribe(event, callback);
        };
    }

    subscribe(event, callback) {
        return this.callbackQueue(event, callback);
    }

    once(event, callback) {
        return this.callbackQueue(event, callback, true);
    }

    publish(event, data) {
        if(!this.isValidEvent(event)) return ;
        this.eventStore[event]?.forEach(cb => cb?.(data));
        const callbackQueue = this.oneEventStore[event];
        if(callbackQueue?.size) {
            callbackQueue.forEach(cb => cb?.(data));
            delete this.oneEventStore[event];
        }
    }

    unsubscribe(event, callback) {
        if(!this.isValidEvent(event) || !callback || typeof callback !== 'function') return ;
        this.eventStore[event]?.delete(callback);
        this.oneEventStore[event]?.delete(callback);
        if(!this.eventStore[event]?.size) delete this.eventStore[event];
        if(!this.oneEventStore[event]?.size) delete this.oneEventStore[event];
    }
}

// EXAMPLE 1
// const ps = new PubSub();

// const unsub = ps.subscribe("click", () => console.log("clicked!"));

// ps.publish("click", null); // logs → clicked!

// unsub(); // cleanup

// ps.publish("click", null); // logs nothing


// EXAMPLE 2
// // Each subscription gets its own independent cleanup
// const ps = new PubSub();

// const unsubA = ps.subscribe("data", () => console.log("Handler A"));
// const unsubB = ps.subscribe("data", () => console.log("Handler B"));

// ps.publish("data", null);
// // logs → Handler A
// // logs → Handler B

// unsubA(); // only remove A

// ps.publish("data", null);
// // logs → Handler B  (A is gone, B still active)

// EXAMPLE 3
// Works well with once too
// const ps = new PubSub();

// const unsub = ps.once("login", (user) => console.log("Welcome,", user));

// unsub(); // unsubscribe before it ever fires

// ps.publish("login", "Alice"); // logs nothing