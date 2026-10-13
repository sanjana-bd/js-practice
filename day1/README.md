# Asynchronous Task Queue Manager with Concurrency & Rate Limiting

A production-ready, highly optimized asynchronous **Task Queue Manager** implemented in JavaScript. This engine accepts asynchronous operations (functions that return Promises), handles priority queues, manages strict concurrent execution slots, and enforces precise minimum interval pacing between tasks.

---

## 🚀 Problem Statement

In single-threaded runtime environments like JavaScript, managing bursts of high-volume asynchronous operations (such as parallel API polling, batch file operations, or web scraping instances) can overload external downstream systems or cause system memory exhaustion. 

The goal was to design an **in-memory Task Queue Manager** capable of orchestrating async workloads under strict architectural rules:
1. **Priority Scheduling**: Tasks with higher priority execution values must jump directly to the front of the queue.
2. **Concurrency Limiting**: Limit the active number of background promises running in flight at any given millisecond.
3. **Pacing/Rate Limiting**: Enforce a minimal cool-down interval (`minInterval`) between consecutive task initializations to avoid overwhelming backend gateways.
4. **Non-Blocking Control Flow**: Allow users to dynamically `pause()` and `resume()` the pulling architecture without disrupting active operations currently in-flight.
5. **Decoupled Resolution Loop**: Expose a standard API matching the deferred promise archetype (`addTask().then()`) so callers can cleanly await their respective localized execution results seamlessly.

---

## 🛠️ Key Architectural Decisions

* **Deferred Promise Mapping**: Instantly provisions a blank pending wrapper promise to the consumer hook while logging the resolution controls (`resolveRef`, `rejectRef`) internally within the heap node array.
* **Greedy Parallel Branching**: Fires parallel structural queries immediately down the stream right before awaiting long-running executions. This removes structural starvation when filling early unpopulated slots under strict concurrency allocations.
* **Timer Flag Locking (`timerId`)**: Tracks scheduling operations using an inline instance handle state flag. This guarantees that large concurrent call arrays arriving simultaneously are cleanly throttled without multiplying out duplicate timer loops or causing a memory leak.

---

## 📊 Class API Specifications

### `new TaskQueue(config)`
Initializes the orchestrator queue instance.
* **`config.maxConcurrency`** *(number, default: 2)*: Maximum active execution streams allowed in flight.
* **`config.minInterval`** *(number, default: 500)*: Minimum delay timeframe in milliseconds required between subsequent execution spawns.

### `addTask(taskFn, priority)`
Appends a callback execution node into the priority tree.
* **`taskFn`** *(Function)*: A custom closure function that initializes and returns a valid Promise.
* **`priority`** *(number, default: 0)*: Numeric rank value. Higher integers prioritize execution ahead of pending lower-priority items.
* **Returns**: A standard native `Promise` that tracks, resolves, or rejects with the ultimate result of the wrapped execution block.

### `pause()`
Suspends pulling new tasks out of the pending list. Active elements executing in the loop finish gracefully.

### `resume()`
Lifts the structural hold state and immediately re-drives the core background dispatch loop.

### `getQueueStatus()`
Exposes current state health telemetry. Returns:
```json
{
  "totalTasks": 4,
  "runningTasks": 2,
  "pendingTasks": 2,
  "isPaused": false
}
```

---

## 💻 Sample Implementation & Testing

```javascript
// Initialization
const queue = new TaskQueue({ maxConcurrency: 2, minInterval: 500 });

// Mock network latency generator
const createNetworkTask = (id, latency) => () => 
    new Promise((resolve) => setTimeout(() => resolve(`Task ${id} Succeeded!`), latency));

console.log("--- Initializing Workload Engine ---");

// Push various tasks onto the loop with different priority weights
queue.addTask(createNetworkTask("Low Priority A", 1000), 1).then(console.log);
queue.addTask(createNetworkTask("High Priority B", 1000), 10).then(console.log);
queue.addTask(createNetworkTask("Mid Priority C", 1000), 5).then(console.log);
queue.addTask(createNetworkTask("Critical Priority D", 1000), 20).then(console.log);

// Log instant internal telemetry
console.log("Telemetry Update:", queue.getQueueStatus());
```
