class PromiseMe {

    static resolve = (value) => {
        let promise = new PromiseMe((resolve, reject) => {
            resolve(value);
        });
        
        return promise;
    }

    static reject = (reason) => {
        let promise =  new PromiseMe((resolve, reject) => {
            reject(reason)
        });
        
        return promise;
    }

    constructor(handler) {
        this.status = "pending";
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];

        const resolve = value => {
            if (this.status === "pending") {
                this.status = "resolve";
                this.value = value;
                this.onFulfilledCallbacks.forEach(fn => fn(value));
            }
        };

        const reject = value => {
            if (this.status === "pending") {
                this.status = "rejected";
                this.value = value;
                this.onRejectedCallbacks.forEach(fn => fn(value));
            }
        };

        try {
            handler(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }

    then(onFulfilled, onRejected) {
        return new PromiseMe((resolve, reject) => {
            if (this.status === "pending") {
                this.onFulfilledCallbacks.push(() => {
                    try {
                        const fulfilledFromLastPromise = onFulfilled(this.value);
                      if(fulfilledFromLastPromise instanceof PromiseMe) {
                        fulfilledFromLastPromise.then(resolve, reject);
                      } else {
                        resolve(fulfilledFromLastPromise);
                      }
                    } catch (err) {
                        reject(err);
                    }
                });
                this.onRejectedCallbacks.push(() => {
                    try {
                        const rejectedFromLastPromise = onRejected(this.value);
                       if(rejectedFromLastPromise instanceof PromiseMe) {
                            rejectedFromLastPromise.then(resolve, reject);
                       } else {
                            reject(rejectedFromLastPromise);
                       }
                    } catch (err) {
                        reject(err);
                    }
                });
            }
    
            if (this.status === "resolve") {
                try {
                    const fulfilledFromLastPromise = onFulfilled(this.value);
                    resolve(fulfilledFromLastPromise);
                } catch (err) {
                    reject(err);
                }
    
            }
    
            if (this.status === "rejected") {
                try {
                    const rejectedFromLastPromise = onRejected(this.value);
                    reject(rejectedFromLastPromise);
                } catch (err) {
                    reject(err);
                }
            }
        });
    }

    catch(error) {
        this.then(null, error);
    }
    
}

// tests

PromiseMe.resolve('Hello World').then(() => {
    return PromiseMe.resolve('Hello World');
}).then(value => {
    console.log(value);
})

/* let p = PromiseMe.resolve('Hello World');
let p1 = p.then((value) => {
    console.log(value);
})

console.log(p1); */

module.exports = PromiseMe;
