const STATUS_PENDING = 'pending';
const STATUS_FULFILLED = 'fulfilled';
const STATUS_REJECTED = 'rejected';

function executeFnWithCatchError(fn, params, resolve, reject) {
  try {
    const result = fn(params);
    resolve(result);
  } catch (error) {
    reject(error);
  }
}
class _Promise {
  constructor(executor = () => {}) {
    // 立即执行构造函数，并且将状态变为pending
    this.status = STATUS_PENDING;

    this.value = undefined;
    this.reason = undefined;

    // 因为可以执行多次then，因此需要将所有的任务放在一个队列中
    this.resolveQueue = [];
    this.rejectQueue = [];

    const resolve = value => {
      // 执行resolve后，状态变成fulfilled
      // 如果状态是pending时，才会改变状态
      if (this.status === STATUS_PENDING) {
        this.status = STATUS_FULFILLED;
        this.value = value;
        // 执行resolve队列中的任务
        if (this.resolveQueue.length) {
          this.resolveQueue.forEach(fn => fn(this.value));
        }
      }
    };

    const reject = reason => {
      // 执行reject后，状态变成rejected
      // 如果状态是pending时，才会改变状态
      if (this.status === STATUS_PENDING) {
        this.status = STATUS_REJECTED;
        this.reason = reason;
        // 执行reject队列中的任务
        if (this.rejectQueue.length) {
          this.rejectQueue.forEach(fn => fn(this.reason));
        }
      }
    };

    try {
      // 传入的两个回调会有两个参数 resolve和reject
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // 想要实现链式调用，就需要返回一个新的Promise对象
    return new _Promise((resolve, reject) => {
      if (this.status === STATUS_FULFILLED && onFulfilled) {
        // 将onFulfilled返回的值作为下一个Promise resolve的值
        executeFnWithCatchError(onFulfilled, this.value, resolve, reject);
      }
      if (this.status === STATUS_REJECTED && onRejected) {
        // 将onRejected返回的值作为下一个Promise reject的值
        executeFnWithCatchError(onRejected, this.value, resolve, reject);
      }

      if (this.status === STATUS_PENDING) {
        // 这里队列实在构造函数中处理的，所以需要转化一下
        if (onFulfilled) {
          this.resolveQueue.push(params => {
            executeFnWithCatchError(onFulfilled, params, resolve, reject);
          });
        }
        if (onRejected) {
          this.rejectQueue.push(params => {
            executeFnWithCatchError(onRejected, params, resolve, reject);
          });
        }
      }
    });
  }
}
module.exports = _Promise;
