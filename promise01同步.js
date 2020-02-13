// promise 本意 承诺 三个状态 成功态 失败态 等待态
// 默认是等待态 等待态可以变成  成功态/失败态
// 成功就不能失败 也不能 从失败变成成功
// 在低版本浏览器 不支持的 es6-promise
// executor是立即执行的
// 每个promise实例都有一个then方法,参数是成功和失败，成功会有成功的值 失败
//  同一个promise可以多次then
// Promise是一个类
// new Promise时 会传递一个执行器
//1.实现基本的promise
// console.log(Promise);
let Promise = require('./Promise-01同步')
// console.log(Promise);
let promise = new Promise((resolve, reject) => {
  console.log(1);
  // resolve('买'); // 同步调用resolve函数
  reject('不买'); // 同步调用reject函数
});
console.log(2);

promise.then((data) => {
  console.log('data==', data);
}, (err) => {
  console.log('err==', err);
});
console.log(3);

// promise.then((data) => {
//   console.log('data', data);
// }, (err) => {
//   console.log('err', err);
// });