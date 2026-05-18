/*
   Extend your existing PubSub class with a new method: (refer to first question - eventEmitter)
   once(event, callback)
   Works exactly like subscribe, but the callback should fire only the first time the event is published. After that, it should automatically unsubscribe itself.
*/

class PubSub {
    eventStore = {};
    oneEventStore = {};

    isValidEvent(event) {
        return this.eventStore[event] || this.oneEventStore[event];
    }

    callbackQueue(event, callback, shouldFireOnce = false) {
        if(!event || !callback || typeof callback !== 'function') return ;
        const queue = shouldFireOnce ? this.oneEventStore : this.eventStore;
        if(!queue[event]) queue[event] = new Set([callback]);
        else queue[event].add(callback);
    }

    subscribe(event, callback) {
        this.callbackQueue(event, callback);
    }

    once(event, callback) {
        this.callbackQueue(event, callback, true);
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

// ps.once("login", (user) => console.log("Welcome,", user));

// ps.publish("login", "Alice"); // logs → Welcome, Alice
// ps.publish("login", "Bob");   // logs nothing
// ps.publish("login", "Carol"); // logs nothing

// EXAMPLE 2
// // once and subscribe co-existing on the same event
// const ps = new PubSub();

// ps.subscribe("click", () => console.log("Permanent listener"));
// ps.once("click", () => console.log("One time listener"));

// ps.publish("click", null);
// // logs → Permanent listener
// // logs → One time listener

// ps.publish("click", null);
// // logs → Permanent listener   (only this fires now)


// EXAMPLE 3
// // Multiple once listeners
// const ps = new PubSub();

// ps.once("data", (v) => console.log("Once A:", v));
// ps.once("data", (v) => console.log("Once B:", v));

// ps.publish("data", 42);
// // logs → Once A: 42
// // logs → Once B: 42

// ps.publish("data", 99);
// // logs nothing