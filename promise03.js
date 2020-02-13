let Promise = require('./Promise-2');
let promise = new Promise((resolve, reject) => {
  resolve('xxx');
  reject();
});
let p = new Promise((resolve, reject)=>{
  setTimeout(() => {
    resolve(100);
  }, 3000);
});
let promise2 = promise.then((data) => {
  return new Promise((resolve,reject)=>{
    resolve(new Promise((resolve,reject)=>{
      resolve(1000)
    }))
  })
}, (err) => {
  console.log('err', err);
})
promise2.then(data=>{
  console.log(data);
},err=>{
  console.log('error',err);
});

// 链式调用  返回this promise不能返回this,promise实现链式调用是靠返回一个新的promise
// let promise = new Promise((resolve,reject)=>{
//   resolve();
// })
// promise.then(data=>{
//   return Promise.reject('失败') // 如果返回this，那这个Promise就会从之前的成功便成失败！！！！！
// }).then(null,err=>{
//   console.log(err);
// })
