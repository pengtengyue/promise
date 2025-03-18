学习 JavaScript Promise 的核心特性与实现机制，手写符合 Promises/A+ 规范的 Promise 实现

```
下载依赖
npm install

自动扫描所有 .test 文件，开始跑ut
npm run test

查看覆盖率
jest --coverage
需要全局安装过jest（npm install --global jest）
```

# Promise介绍

#### 什么是一个Promise？

- 是一个类
- 当通过new创建Promise实例，需要传入一个回调函数，我们称之为executor
  - 这个回调函数会被立即执行，并传入两个回调函数的参数（resolve，reject）
  - 当调用resolve回调函数时，会执行Promise对象的then方法传入的回调
  - 当调用reject回调函数时，会执行Promise对象的catch方法传入的回调
- Promise是一个状态机，分为3种状态
  - pending：待定状态，执行了executor后，处于该状态
  - fulfilled：调用resolve()后，Promise的状态更改为fulfilled，且无法再次更改
  - rejected：调用reject()后，Promise的状态更改为rejected，且无法再次更改
- resolve的参数
  - 如果传入的是一个普通的值或者是对象，则会传递到then的参数中
  - 如果传入的是一个Promise，那么当前的Promise状态会由传入的Promise决定
  - 如果传入的是一个对象，并且该对象实现了then方法（thenable），也会执行该then方法，并且又该then方法决定后续状态
- Promise的实例方法
  - then方法
    通过then方法可以对Promise中的resolve进行处理，then方法的返回值是一个Promise实例
  - 多次调用then方法
    同一个Promise实例可以调用多个then方法，当Promise中resolve被回调时，所有then方法传入的回调函数都会被执行
  ```
  const promise = new Promise(resolve => {
    resolve('Hello')
  })
  promise.then(res => console.log(res))
  promise.then(res => console.log(res))
  promise.then(res => console.log(res))

  // log日志如下：
  // Hello
  // Hello
  // Hello
  ```

  - then方法传入的回调函数可以有返回值
  如果返回的是普通值，那么这个普通值作为一个新的Promise的resolve值

  ```
  const promise = new Promise(resolve => {
    resolve('Hello');
  });

  promise
    .then(() => {
      return 'then';
    })
    .then(res => console.log(res));

  // 上下promise逻辑等价（关注第一个then回调里的return）

  promise
    .then(() => {
      return new Promise(resolve => resolve('then'));
    })
    .then(res => console.log(res));

  // log日志如下：
  // then
  // then
  ```
   如果返回的是Promise，那么就可以再次调用then方法
   如果返回的是一个对象，并且实现了thenable，该then函数由两个参数resolve和reject，则resolve会传递给下一个Promise
  ```
  const promise = new Promise(resolve => {
    resolve('Hello');
  });

  promise
    .then(() => {
      return {
        name: 'test-v1'
      };
    })
    .then(res => console.log(res));
  // { name: 'test-v1' }

  promise
    .then(() => {
      return {
        name: 'test-v1',
        then: (resolve) => {
          return resolve('test-v2')
        }
      };
    })
    .then(res => console.log(res));
  // test-v2
  // 此时输入的是test-v2，是返回对象的then方法里resolve传递的值
  ```

  - catch方法
  除了then方法的第二个参数来捕获reject错误外，我们还可以通过catch方法，catch返回一个Promise
  catch方法也是可以多次调用的，只要Promise实例的状态是rejected，那么就会调用catch方法

  ```
  const promise = new Promise((_resolve, reject) => {
    reject('error');
  });

  promise
    .then(
      null,
    )
    .catch(err => console.log(err));
  // error
  ```
  推荐使用catch，来捕获错误，虽然then的第二个参数回调也能处理错误，但有些场景会捕获不到
  ```
  const promise = new Promise((resolve, reject) => {
    reject('error');
  });
  promise
    .then(
      res => {
        console.log('then res', res);
        throw new Error('error');
      },
      err => {
        // reject执行后，成功打印了
        console.log('then err', err);
      },
    )
    .catch(err => {
      // 不会打印，reject抛出错误后，由于就近原则，then的第二个参数会先捕获到异常，如果没有第二个参数，才会轮到catch来捕获
      console.log('catch err', err);
    });
  // then err error

  // 注意这种情况，resolve执行后
  const promise = new Promise(resolve => {
    resolve('success');
  });
  promise
    .then(
      res => {
        console.log('then res', res);
        throw new Error('error');
      },
      err => {
        // 该打印不会执行
        console.log('then err', err);
      },
    )
    .catch(err => {
      console.log('catch err', err);
    });
  // then res success
  // catch err Error: error
  ```


  - finally方法
  无论一个Promise实例是fulfilled还是rejected，finally都会执行，finally不接受任何参数
  ```
    const promise = new Promise((resolve, reject) => {
      reject('error');
    });
    promise
      .then(() => {})
      .catch(err => {
        console.log(err);
      }).finally(() => {
        console.log('finally')
      })
    // error
    // finally
  ```


