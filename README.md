# promise

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

### Promise介绍

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
