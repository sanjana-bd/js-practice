/*
    Implement a PubSub class with the following three methods:
    subscribe(event, callback)
    Registers a callback function to be called whenever the given event is published.
    publish(event, data)
    Calls all callbacks that are currently subscribed to the given event, passing data to each of them.
    unsubscribe(event, callback)
    Removes a specific callback from the given event so it no longer gets called on future publishes.
*/

class PubSub {
    eventStore = {};

    isValidEvent(event) {
        if(!this.eventStore[event]) {
            console.error('Event has not been subscribed!!');
            return false;
        }
        return true;
    }

    subscribe(event, callback) {
        if(!event || !callback) return ;
        if(!this.eventStore[event]) this.eventStore[event] = [callback];
        else this.eventStore[event].push(callback);
    }

    publish(event, data) {
        if(!this.isValidEvent(event)) return ;
        this.eventStore[event]?.forEach(cb => cb?.(data));
    }

    unsubscribe(event, callback) {
        if(!this.isValidEvent(event) || !callback) return ;
        const remainingCallbacks = this.eventStore[event]?.filter(cb => cb !== callback);
        this.eventStore[event] = remainingCallbacks;
    }
}

// EXAMPLE 1
// const ps = new PubSub();

// const handler = (data) => console.log("Received:", data);

// ps.subscribe("greet", handler);
// ps.publish("greet", "Hello!");       // logs → Received: Hello!
// ps.publish("greet", "How are you?"); // logs → Received: How are you?

// ps.unsubscribe("greet", handler);
// ps.publish("greet", "Hello again!"); // logs nothing


// EXAMPLE 2
// const ps = new PubSub();

// ps.subscribe("news", (data) => console.log("Reader 1:", data));
// ps.subscribe("news", (data) => console.log("Reader 2:", data));

// ps.publish("news", "Breaking news!");
// // logs → Reader 1: Breaking news!
// // logs → Reader 2: Breaking news!


// EXAMPLE 3
// Subscribing to different events independently
// const ps = new PubSub();

// ps.subscribe("login",  (user) => console.log("Logged in:", user));
// ps.subscribe("logout", (user) => console.log("Logged out:", user));

// ps.publish("login", "Alice");  // logs → Logged in: Alice
// ps.publish("logout", "Alice"); // logs → Logged out: Alice
// ps.publish("login", "Bob");    // logs → Logged in: Bob