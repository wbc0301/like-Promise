class Promise {
  constructor (executor) {
    this.status = 'pending' // 默认的状态： pending

    this.value = undefined // 成功的值
    this.reason = undefined // 失败的原因

    this.onResolvedCallbacks = [] // 成功回调的数组
    this.onRejectedCallbacks = [] // 失败回调的数组

    let resolve = value => {
      if (this.status === 'pending') {
        // 只有当前状态是pending的时候才可以改变状态，就是在这里决定的
        this.status = 'fulfilled' // 成功了
        this.value = value
        this.onResolvedCallbacks.forEach(fn => fn()) // 异步执行的Promise  异步完成后调用，相当于"发布"
      }
    }
    let reject = reason => {
      if (this.status === 'pending') {
        // 只有当前状态是pending的时候才可以改变状态，就是在这里决定的
        this.status = 'rejected' // 失败了
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn()) // 异步执行的Promise  异步完成后调用，相当于"发布"
      }
    }
    try {
      executor(resolve, reject) // 当new Promise的时候就会执行传进来的这个函数
    } catch (e) {
      reject(e) // 如果new Promise()里边有抛出异常，直接捕捉，同时执行reject(err)
    }
  }

  then (onFulfilled, onRejected) {
    let promise2 // 为实现 .then 的链式调用，需要每次调用时返回一个新的promise对象。
    promise2 = new Promise((resolve, reject) => {
      //1: 如果是同步调用，当 promise.then() 的时候就直接调用 .then() 里边的函数
      if (this.status === 'fulfilled') {
        onFulfilled(this.value)
      }
      if (this.status === 'rejected') {
        onRejected(this.reason)
      }

      //2: 如果是异步调用，就会把then()里边的成功和失败的函数放进callbacks数组中，相当于订阅
      //   当异步执行完成，调用 resolve 或 reject 时回调用它们，那时相当于发布
      if (this.status === 'pending') {
        this.onResolvedCallbacks.push(() => {
          onFulfilled(this.value)
        })
        this.onRejectedCallbacks.push(() => {
          onRejected(this.value)
        })
      }
    })
    return promise2
  }
}

module.exports = Promise
// export default Promise;
