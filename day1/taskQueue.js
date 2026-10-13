const DEFAULT_MAX_CONCURRENCY = 2;
const DEFAULT_MIN_INTERVAL = 500;

class TaskQueue {
    maxConcurrency = 0;
    minInterval = 0;
    tasks = [];
    runningTasksCt = 0;
    lastTaskExecTime = 0;
    timerId = null;

    // default values for maxConcurrency, minINterval
    constructor(config) {
        this.maxConcurrency = config?.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY;
        this.minInterval = config?.minInterval ?? DEFAULT_MIN_INTERVAL;
    }

    addTasksToRunningQueue() {
        const tasksToBeRun = this.maxConcurrency - this.runningTasks.length;
        for(let i=0;i<tasksToBeRun;i++) {
            if(this.tasks.length) {
                this.runningTasks.push(this.tasks.shift());
            } else break;
        }
    }

    async runTask() {
        if(this.runningTasksCt >= this.maxConcurrency || this.tasks.length === 0) return;

        const newTimeDelay = Date.now() - this.lastTaskExecTime;
        if(this.runningTasksCt > 0 && newTimeDelay < this.minInterval) {
            if(this.timerId) return ; 
            this.timerId = setTimeout(() => {
                this.runTask();
                clearTimeout(this.timerId);
                this.timerId = null;
            }, this.minInterval - newTimeDelay);
            return ;
        }

        const task = this.tasks.shift();
        this.runningTasksCt++;
        this.lastTaskExecTime = Date.now();
        this.runTask();
        try {
            const result = await task?.callback();
            task?.resolveRef(result);
        } catch (error) {
            task?.rejectRef(error);
        } finally {
            this.runningTasksCt--;
            this.runTask();
        }
    }

    addTask(taskFn, priority) {
        let resolveRef = null;
        let rejectRef = null;
        const returnedPromise = new Promise((res, rej) => {
            resolveRef = res;
            rejectRef = rej;
        });
        this.tasks.push({
            callback: taskFn,
            priority,
            resolveRef,
            rejectRef
        });
        this.tasks.sort((taskA, taskB) => taskB.priority - taskA.priority);
        this.runTask();

        return returnedPromise;
    }

    getQueueStatus() {
        return {
            totalTasks: this.tasks.length + this.runningTasksCt,
            runningTasks: this.runningTasksCt,
            pendingTasks: this.tasks.length
        }
    }
}