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
    onFulfilled = onFulfilled ? onFulfilled : value => value;
    onRejected = onRejected
      ? onRejected
      : reason => {
          throw new Error(reason);
        };

    // 想要实现链式调用，就需要返回一个新的Promise对象
    return new _Promise((resolve, reject) => {
      if (this.status === STATUS_FULFILLED) {
        // 将onFulfilled返回的值作为下一个Promise resolve的值
        executeFnWithCatchError(onFulfilled, this.value, resolve, reject);
      }
      if (this.status === STATUS_REJECTED) {
        // 将onRejected返回的值作为下一个Promise reject的值
        executeFnWithCatchError(onRejected, this.reason, resolve, reject);
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

  catch(onRejected) {
    // 直接复用then方法的逻辑即可，将闯入的数据作为then的第二个参数
    // 当你调用promise.catch(onRejected)的时候，其实就是在Promise上调用then，只是不传入成功回调，只传入失败回调
    // 如果promise被拒绝(rejected)，则会调用传入的onRejected函数，如果promise成功，则直接返回成功的值不做处理
    this.then(null, onRejected);
  }
}
module.exports = _Promise;
