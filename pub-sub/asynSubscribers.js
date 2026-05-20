/*
    First Refer to question 
        - 1. eventEmitter
        - 2. oneTimeEmitter
        - 3. returnUnsubscribe
    Modify publish so that it returns a Promise that resolves only after all subscriber callbacks have completed — even if some of them are async.
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
        let called = false;
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
        let promiseArr = Array.from(this.eventStore[event]?.values())?.map(cb => cb?.(data));
        const callbackQueue = this.oneEventStore[event];
        if(callbackQueue?.size) {
            promiseArr = promiseArr.concat(Array.from(callbackQueue.values()).map(cb => cb?.(data)));
            delete this.oneEventStore[event];
        }
        return Promise.allSettled(promiseArr);
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

// ps.subscribe("fetch", async (url) => {
//     await new Promise(r => setTimeout(r, 500));
//     console.log("Fetched:", url);
// });

// ps.subscribe("fetch", (url) => {
//     console.log("Logged:", url);
// });

// await ps.publish("fetch", "/api/data");
// // logs → Logged: /api/data
// // after 500ms → Fetched: /api/data
// // only then → resolves


// EXAMPLE 2
// // publish resolves after ALL async subscribers finish
// const ps = new PubSub();

// ps.subscribe("save", async () => {
//     await new Promise(r => setTimeout(r, 1000));
//     console.log("DB saved");
// });

// ps.subscribe("save", async () => {
//     await new Promise(r => setTimeout(r, 500));
//     console.log("Cache saved");
// });

// await ps.publish("save", null);
// // after 500ms → Cache saved
// // after 1000ms → DB saved
// // only then → resolves

// EXAMPLE 3
// // if one subscriber throws, others should still run
// const ps = new PubSub();

// ps.subscribe("process", async () => {
//     throw new Error("something went wrong");
// });

// ps.subscribe("process", () => {
//     console.log("I should still run");
// });

// await ps.publish("process", null);
// // logs → I should still run
// // publish still resolves (doesn't reject)