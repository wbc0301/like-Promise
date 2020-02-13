class Promise {
  constructor(executor) {
    this.status = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];
    let resolve = (value) => {
      if (this.status === 'pending') {
        this.status = 'resolved';
        this.value = value;
        this.onResolvedCallbacks.forEach(fn => fn());
      }
    }
    let reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    }
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e); // 如果出现异常就走错误处理  （同步的 简单）
    }
  }

  then(onFufilled, onRejected) {
    // 默认成功和失败不传的情况
    onFufilled = typeof onFufilled === 'function' ? onFufilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => {
      throw err
    }
    let promise2;
    promise2 = new Promise((resolve, reject) => {
      if (this.status === 'resolved') {
        setTimeout(() => {
          try {
            let x = onFufilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);

      }
      if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === 'pending') {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFufilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        })
      }
    });
    return promise2;
  }

  catch(fn) {
    return this.then(null, fn);
  }
}

Promise.all = (promises) => {
  return new Promise((resolve, reject) => {
    let result = [];
    let index = 0;
    let processData = (key, y) => {
      index++
      result[key] = y;
      if (promises.length === index) {
        resolve(result);
      }
    }
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(y => {
        processData(i, y);
      }, reject);
    }
  })
}
Promise.race = (promises) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject);
    }
  })
}
Promise.resolve = function (data) {
  return new Promise((resolve, reject) => {
    resolve(data);
  })
}
Promise.reject = function (data) {
  return new Promise((resolve, reject) => {
    reject(data);
  })
}

// 实现多套promise共用的情况
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('循环引用'));
  }
  // {then:{}}
  let called;
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then; // 如果是对象 我就试着取一下then方法
      if (typeof then === 'function') { // 就是promise了
        then.call(x, y => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;

          // resolve的结果依旧是promise 那就继续解析
          resolvePromise(promise2, y, resolve, reject);
        }, r => {
          if (called) return;
          called = true;
          reject(r);// 失败了就失败了
        })
      } else { // x.then 是对象
        resolve(x); // 直接成功即可
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e); // 取then出错了那就不要在继续执行了
    }
  } else { // x 是字符串，数字，undefined
    resolve(x);
  }
}

// 目前是通过他测试 他会测试一个对象
// 语法糖
Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}
module.exports = Promise;
// npm install  promises-aplus-tests -g
// promises-aplus-tests




