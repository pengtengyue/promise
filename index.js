const STATUS_PENDING = 'pending';
const STATUS_FULFILLED = 'fulfilled';
const STATUS_REJECTED = 'rejected';

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
    // 由于executor可能是一个异步函数，所以不能直接执行
    // 需要做状态判断
    // 如果执行then的时候，Promise实例状态已经发生改变了，则直接执行传入的函数
    if (
      this.status === STATUS_FULFILLED &&
      onFulfilled &&
      typeof onFulfilled === 'function'
    ) {
      onFulfilled(this.value);
    }

    if (
      this.status === STATUS_REJECTED &&
      onRejected &&
      typeof onRejected === 'function'
    ) {
      onRejected(this.reason);
    }

    // 如果在执行then的时候，状态还是pending
    // 那么就加入队列，等待执行resolve、reject的时候，统一执行所有队列
    if (this.status === STATUS_PENDING) {
      if (onFulfilled) {
        this.resolveQueue.push(onFulfilled);
      }
      if (onRejected) {
        this.rejectQueue.push(onRejected);
      }
    }
  }
}
module.exports = _Promise;
