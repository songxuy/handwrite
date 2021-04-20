const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  constructor(executer) {
    try {
      executer(this.resolve, this.reject) //executor 是一个执行器，进入会立即执行
    } catch (e) {
      this.reject(e)
    }
  }

  status = PENDING;//当前状态

  value = null;// 成功的值

  reason = null;// 失败的值

  fulfilCallback = []; // 成功的回调
  rejectCallback = []; // 失败的回调
  resolve = (val) => {
    if (this.status === PENDING) {
      this.status = FULFILLED
      this.value = val
      while (this.fulfilCallback.length) {
        this.fulfilCallback.shift()(val)
      }
    }
  }
  reject = (val) => {
    if (this.status === PENDING) {
      this.status = REJECTED
      this.reason = val
      while (this.rejectCallback.length) {
        this.rejectCallback.shift()(val)
      }
    }
  }
  then = (onFulfiled, onReject) => {
    onFulfiled = typeof onFulfiled === 'function' ? onFulfiled : value => value
    onReject = typeof onReject === 'function' ?  onReject : value => { throw value }
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        queueMicrotask(() => {
          try {
            // 获取成功回调函数的执行结果
            const x = onFulfiled(this.value);
            // 传入 resolvePromise 集中处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e)
          }
        }) 
      } else if (this.status === REJECTED) {
        queueMicrotask(() => {
          try {
            // 获取成功回调函数的执行结果
            const x = onReject(this.reason);
            // 传入 resolvePromise 集中处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e)
          }
        })
      } else if (this.status === PENDING) {
        this.fulfilCallback.push(() => {
          queueMicrotask(() => {
            try {
              // 获取成功回调函数的执行结果
              const x = onFulfiled(this.value);
              // 传入 resolvePromise 集中处理
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error)
            } 
          }) 
  
        })
        this.rejectCallback.push(() => {
          queueMicrotask(() => {
            try {
              // 获取成功回调函数的执行结果
              const x = onReject(this.reason);
              // 传入 resolvePromise 集中处理
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error)
            }
          })
        })
      }
    })
    return promise2
  }
  static resolve (parameter) {
    // 如果传入 MyPromise 就直接返回
    if (parameter instanceof MyPromise) {
      return parameter;
    }
    return new MyPromise(resolve =>  {
      resolve(parameter);
    });
  }
  static reject (reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }
}
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  if (x instanceof MyPromise) {
    x.then(resolve, reject)
  } else {
    resolve(x)
  }
}

module.exports = MyPromise