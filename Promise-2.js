class Promise {
  constructor(executor) {
    this.status = 'pending'
    this.value = undefined
    this.reason = undefined
    this.onResolvedCallbacks = []
    this.onRejectedCallbacks = []
    let resolve = value => {
      if (this.status === 'pending') {
        this.status = 'resolved'
        this.value = value
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    let reject = reason => {
      if (this.status === 'pending') {
        this.status = 'rejected'
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e) // 如果出现异常就走错误处理  （同步的 简单）
    }
  }

  then(onFufilled, onRejected) {
    // 默认成功和失败不传的情况
    onFufilled = typeof onFufilled === 'function' ? onFufilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
    let promise2
    promise2 = new Promise((resolve, reject) => {
      // 必须用箭头函数 以保证下边的this指向当前promise实例
      if (this.status === 'resolved') {
        setTimeout(() => {
          try {
            let x = onFufilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.status === 'pending') {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFufilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return promise2
  }

  catch(fn) {
    return this.then(null, fn)
  }

  finally(fn) {
    return this.then(fn, fn)
  }

}

Promise.prototype.catch = function(fn) {
  return this.then(null, fn)
}

Promise.prototype.finally = function(fn) {
  return this.then(
    value => {
      fn()
      return value
    },
    error => {
      fn()
      throw error
    },
  )
}

Promise.prototype.finally = function(fn) {
  return this.then(
    value => Promise.resolve(fn()).then(() => value),
    error => Promise.resolve(fn()).then(() => {throw error}),
  )
}

Promise.all = promises => {
  return new Promise((resolve, reject) => {
    let result = [] // 记录结果
    let index = 0   // 记录成功的个数
    for (let idx = 0; idx < promises.length; idx++) {
      promises[idx].then(value => {
        index++
        result[idx] = value
        if (promises.length === index) {
          resolve(result)
        }
      }, reject)
    }
  })
}

Promise.any = promises => {
  return new Promise((resolve, reject) => {
    let result = [] // 记录结果
    let index = 0   // 记录失败的个数
    for (let idx = 0; idx < promises.length; idx++) {
      promises[idx].then(resolve, err => {
        index++
        result[idx] = err
        if (promises.length === index) {
          reject(new AggregateError(result))
        }
      })
    }
  })
}

Promise.race = promises => {
  return new Promise((resolve, reject) => {
    for (let idx = 0; idx < promises.length; idx++) {
      promises[idx].then(resolve, reject)
    }
  })
}

Promise.resolve = function (data) {
  return new Promise((resolve, reject) => ( resolve(data) ))
}

Promise.reject = function (data) {
  return new Promise((resolve, reject) => ( reject(data) ))
}

// 实现多套promise共用的情况
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('循环引用'))
  }
  let called
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    // 对象|函数
    try {
      let then = x.then
      if (typeof then === 'function') {
        // 是promise
        then.call(
          x,
          y => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject) // 递归
          },
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        // 普通对象   成功
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    //  2.字符串，3.数字，4.undefined 5.null  6.数组      成功
    resolve(x)
  }
}

// 目前是通过他测试 他会测试一个对象
// 语法糖
Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}
module.exports = Promise
// npm install  promises-aplus-tests -g
// promises-aplus-tests
