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

  /** 

  // TODO 研究下为啥这条测试用例为啥不做处理也能通过

  test('在链式调用的过程中出现任何错误， 将由下面的then第二个参数处理', () => {
    new _Promise(resolve => {
      resolve('success1');
    })
      .then(res => {
        expect(res).toBe('success1');
        throw new Error('error1');
        // return new _Promise((resolve, reject) => {
        //   reject('error1');
        // });
      })
      .then(null, err => {
        console.log('执行进来了'， err)
        // 好奇怪，err哪怕不对这里也会通过
        // expect('error2').toBe('error1');  这样写也通过
        expect(err).toBe('error1');
        throw new Error('error2');
      });
  });

  */

  test('catch应该捕获上一个Promise实例的reject', () => {
    new _Promise((_resolve, reject) => {
      reject('error1');
    }).catch(err => {
      expect(err).toBe('error1');
    });

    new _Promise((resolve, _reject) => {
      resolve('success');
    })
      .then(null, err => {
        throw new Error('error');
      })
      .catch(err => {
        expect(err).toEqual(new Error('error'));
      });
  });

  test('catch 可以捕获最开始的reject', () => {
    new _Promise((_resolve, reject) => {
      reject('error1');
    })
      .then(res => {
        return res;
      })
      .catch(err => {
        expect(err.message).toBe('error1');
      });
  });
});
