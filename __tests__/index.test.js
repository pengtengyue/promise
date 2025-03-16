const _Promise = require('../index');
describe('_Promise', () => {
  test('应该立即执行构造函数传入的代码', () => {
    let timer = 0;
    new _Promise(() => {
      timer = 1;
    });
    expect(timer).toBe(1);
  });

  test('Promise 有3种状态', () => {
    const p1 = new _Promise();
    expect(p1.status).toBe('pending');

    const p2 = new _Promise(resolve => resolve());
    expect(p2.status).toBe('fulfilled');

    const p3 = new _Promise((_resolve, reject) => reject());
    expect(p3.status).toBe('rejected');
  });

  test('执行resolve和reject后状态固化', () => {
    const p1 = new _Promise((resolve, reject) => {
      resolve();
      reject();
    });
    expect(p1.status).toBe('fulfilled');

    const p2 = new _Promise((resolve, reject) => {
      reject();
      resolve();
    });
    expect(p2.status).toBe('rejected');
  });

  test('then方法可以接受两个参数，可以处理resolve和reject', () => {
    new _Promise(resolve => {
      resolve('success');
    }).then(res => {
      expect(res).toBe('success');
    });

    new _Promise((_resolve, reject) => {
      reject('error');
    }).then(null, err => {
      expect(err).toBe('error');
    });
  });

  test('executor可以是一个异步函数', () => {
    new _Promise(resolve => {
      setTimeout(() => {
        resolve('success');
      }, 1000);
    }).then(res => {
      expect(res).toBe('success');
    });
    new _Promise((_resolve, reject) => {
      setTimeout(() => {
        reject('error');
      }, 1000);
    }).then(null, err => {
      expect(err).toBe('error');
    });
  });

  test('如果构造函数抛出了一个错误，then的第二个参数也可以捕获这个错误', () => {
    new _Promise(() => {
      throw new Error('error');
    }).then(null, err => {
      // expect(err.message).toBe('error');
      expect(err).toEqual(new Error('error'));
    });
  });

  test('链式调用', () => {
    new _Promise(resolve => {
      resolve('success1');
    })
      .then(res => {
        expect(res).toBe('success1');
        return 'success2';
      })
      .then(res => {
        expect(res).toBe('success2');
      });

    new _Promise((_resolve, reject) => {
      reject('error1');
    })
      .then(null, err => {
        expect(err).toBe('error1');
        return 'error2';
      })
      .then(null, err => {
        expect(err).toBe('error2');
      });
  });
});
