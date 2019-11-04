const resolve = function (v) {
  const i = findIndex(this.chain, 1);
  const fun = i >= 0 ? this.chain[i].success : () => { };
  this.chain.splice(0, i + 1);
  const result = fun(v);
  handle.call(this, result, v);
};

const reject = function (v) {
  const i = findIndex(this.chain, 0);
  const fun = i >= 0 ? this.chain[i].fail : () => { };
  this.chain.splice(0, i + 1);
  const result = fun(v);
  handle.call(this, result, v);
};

const findIndex = function (chain, isSuccess) {
  const l = chain.length;
  let i = 0;
  for (; i < l; i++) {
    if (chain[i] && chain[i][isSuccess ? 'success' : 'fail']) {
      return i;
    }
  }
  return undefined;
};

const handle = function (result, v) {
  if (!this.chain.length) {
    this[STATUS_NAME] = 'resolved';
    return;
  } else if (result instanceof ZPromise) {
    result.chain = result.chain.concat(this.chain);
    if (result[STATUS_NAME] === 'pending') {
    } else {
      result.resolve(result[VALUE_NAME]);
    }
  } else {
    this.resolve(result);
    this[VALUE_NAME] = v;
  }
};

const STATUS_NAME = '[[PromiseStatus]]';
const VALUE_NAME = '[[PromiseValue]]';

function ZPromise(fun) {
  this.chain = [];
  this.resolve = v => {
    try {
      resolve.call(this, v);
    } catch (e) {
      this.reject(e);
    }
  };
  this.reject = v => {
    try {
      reject.call(this, v);
    } catch (e) {
      this.reject(e);
    }
  };
  this[STATUS_NAME] = 'pending';
  this[VALUE_NAME] = undefined;
  try {
    fun(v => setTimeout(this.resolve, 0, v), v => setTimeout(this.reject, 0, v));
  } catch (e) {
    this.reject(e);
  }
}

ZPromise.prototype = {
  then: function (success, fail) {
    this.chain.push({
      success,
      fail
    });
    return this;
  },
  catch: function (fail) {
    this.chain.push({
      fail
    });
    return this;
  },
  finally: function (fun) { }
};
ZPromise.length = 1;
ZPromise.resolve = v => {
  return new ZPromise((resolve, reject) => {
    resolve(v);
  });
};
ZPromise.reject = v => {
  return new ZPromise((resolve, reject) => {
    reject(v);
  });
};
ZPromise.all = promises => {
  const l = promises.length;
  let i = 0;
  let count = 0;
  const result = [];
  let _resolve;
  const handle = () => {
    if (count >= l) {
      _resolve(result);
    }
  };
  for (; i < l; i++) {
    (function (index) {
      promises[index].then(v => {
        result[index] = v;
        count++;
        handle();
      });
    })(i);
  }
  return new ZPromise(resolve => {
    _resolve = resolve;
  });
};
ZPromise.race = promises => {
  const l = promises.length;
  let i = 0;
  let _resolve;
  let lock = false;
  const handle = v => {
    if (lock) {
      return;
    }
    _resolve(v);
  };
  for (; i < l; i++) {
    (function (index) {
      promises[index].then(v => {
        handle(v);
      });
    })(i);
  }
  return new ZPromise(resolve => {
    _resolve = resolve;
  });
};

module.exports = ZPromise;



// 分割线-------------------------------------------------------------------------------------------------------------------


// 三种状态
const PENDING = "pending";
const RESOLVED = "resolved";
const REJECTED = "rejected";
// promise 接收一个函数参数，该函数会立即执行
function MyPromise(fn) {
  let _this = this;
  _this.currentState = PENDING;
  _this.value = undefined;
  // 用于保存 then 中的回调，只有当 promise
  // 状态为 pending 时才会缓存，并且每个实例至多缓存一个
  _this.resolvedCallbacks = [];
  _this.rejectedCallbacks = [];

  _this.resolve = function (value) {
    if (value instanceof MyPromise) {
      // 如果 value 是个 Promise，递归执行
      return value.then(_this.resolve, _this.reject)
    }
    setTimeout(() => { // 异步执行，保证执行顺序
      if (_this.currentState === PENDING) {
        console.log('111');
        _this.currentState = RESOLVED;
        _this.value = value;
        _this.resolvedCallbacks.forEach(cb => cb());
      }
    })
  };

  _this.reject = function (reason) {
    setTimeout(() => { // 异步执行，保证执行顺序
      if (_this.currentState === PENDING) {
        _this.currentState = REJECTED;
        _this.value = reason;
        _this.rejectedCallbacks.forEach(cb => cb());
      }
    })
  }
  // 用于解决以下问题
  // new Promise(() => throw Error('error))
  try {
    fn(_this.resolve, _this.reject);
  } catch (e) {
    _this.reject(e);
  }
}

MyPromise.prototype.then = function (onResolved, onRejected) {
  var self = this;
  // 规范 2.2.7，then 必须返回一个新的 promise
  var promise2;
  // 规范 2.2.onResolved 和 onRejected 都为可选参数
  // 如果类型不是函数需要忽略，同时也实现了透传
  // Promise.resolve(4).then().then((value) => console.log(value))
  onResolved = typeof onResolved === 'function' ? onResolved : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : r => {throw r};
  console.log('then');
  if (self.currentState === RESOLVED) {
    console.log(RESOLVED);
    return (promise2 = new MyPromise(function (resolve, reject) {
      // 规范 2.2.4，保证 onFulfilled，onRjected 异步执行
      // 所以用了 setTimeout 包裹下
      setTimeout(function () {
        try {
          var x = onResolved(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });
    }));
  }

  if (self.currentState === REJECTED) {
    return (promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        // 异步执行onRejected
        try {
          var x = onRejected(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });
    }));
  }

  if (self.currentState === PENDING) {
    console.log(PENDING);
    return (promise2 = new MyPromise(function (resolve, reject) {
      self.resolvedCallbacks.push(function () {
        // 考虑到可能会有报错，所以使用 try/catch 包裹
        console.log('resolvecalback');
        try {
          console.log('value', self.value, onResolved + '\n');

          var x = onResolved(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (r) {
          reject(r);
        }
      });

      self.rejectedCallbacks.push(function () {
        try {
          var x = onRejected(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (r) {
          reject(r);
        }
      });
    }));
  }
};
// 规范 2.3
function resolutionProcedure(promise2, x, resolve, reject) {
  // 规范 2.3.1，x 不能和 promise2 相同，避免循环引用
  if (promise2 === x) {
    return reject(new TypeError("Error"));
  }
  // 规范 2.3.2
  // 如果 x 为 Promise（就是then 里面的函数返回的是promise），状态为 pending 需要继续等待否则执行
  if (x instanceof MyPromise) {
    if (x.currentState === PENDING) {
      x.then(function (value) {
        // 再次调用该函数是为了确认 x resolve 的
        // 参数是什么类型，如果是基本类型就再次 resolve
        // 把值传给下个 then
        resolutionProcedure(promise2, value, resolve, reject);
      }, reject);
    } else {
      x.then(resolve, reject);
    }
    return;
  }
  // 规范 2.3.3.3.3
  // reject 或者 resolve 其中一个执行过得话，忽略其他的
  let called = false;
  // 规范 2.3.3，判断 x 是否为对象或者函数
  if (x !== null && (typeof x === "object" || typeof x === "function")) {
    // 规范 2.3.3.2，如果不能取出 then，就 reject
    try {
      // 规范 2.3.3.1
      let then = x.then;
      // 如果 then 是函数，调用 x.then
      if (typeof then === "function") {
        // 规范 2.3.3.3
        then.call(
          x,
          y => {
            if (called) return;
            called = true;
            // 规范 2.3.3.3.1
            resolutionProcedure(promise2, y, resolve, reject);
          },
          e => {
            if (called) return;
            called = true;
            reject(e);
          }
        );
      } else {
        // 规范 2.3.3.4
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // 规范 2.3.4，x 为基本类型
    console.log('xxxx', x);
    resolve(x);
  }
}

new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(10);
  }, 5000);
}).then(res => {
  console.log('result data', res);
}).then()