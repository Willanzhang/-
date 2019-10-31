const PENDING = "pending";
const RESOLVED = "resolved";
const REJECT = "reject";

function MyPromise(fn) {
  let _this = this;
  _this.currentState = PENDING;
  _this.value = undefined;
  
  _this.resolvedCallback = [];
  _this.rejectedCallback = [];

  _this.resolve = function(value) {
    if (value instanceof MyPromise) {
      return value.then(_this.resolve, _this.reject);
    }
    setTimeout(() => {
      if (_this.currentState === PENDING) {
        _this.value = value;
        _this.currentState = RESOLVED;
        _this.resolvedCallback.forEach(cb => {
          return cb();
        });
      }
    })
    
  }

  _this.reject = function(reason) {
    setTimeout(() => {
      if (_this.currentState === PENDING) {
        _this.currentState = REJECT;
        _this.value = new Error(reason);
        _this.rejectedCallback.forEach(cb => cb());
      }
    });
  }

  try {
    fn(_this.resolve, _this.reject);
  } catch(e) {
    _this.reject(e);
  }
}

MyPromise.prototype.then = function(onResolved, onRejected) {
  var self = this;
  // 需要返回一个promise
  var promise2;
  onResolved = typeof onResolved === 'function' ? onResolved : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : r => {throw r};

  if (self.currentState === RESOLVED) {
    return (promise2 = new MyPromise(function(resolve, reject) {
      setTimeout(() => {
        try {
          var x = onRejected(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch(reason) {
          reject(reason);
        }
      });
    }))
  }

  if (self.currentState === REJECT) {
    return (promise2 = new MyPromise(function(resolve, reject){
      setTimeout(() => {
        try {
          var x = onRejected(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch(reason) {
          reject(reason);
        }
      })
    }))
  }

  if (self.currentState === PENDING) {
    console.log(PENDING);
    return (promise2 = new MyPromise(function(resolve, reject) {
      self.resolvedCallback.push(function() {
        try {
          console.log('value', self.value, onResolved + '\n');
          var x = onResolved(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch(r) {
          reject(r);
        }
      })
      
      self.rejectedCallback.push(function() {
        try {
          var x = onRejected(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (r) {
          reject
        }
      })
    }))
  }
}

// 就是用来处理 （这个！！）then 返回的 promise 的状态和值
function resolutionProcedure (promise2, x, resolve, reject) {
  if (promise2 === x ) {
    return reject(new TypeError('Error'));
  }

  // 返回值是
  if (x instanceof MyPromise) {
    if (x.currentState === PENDING) {
      x.then(function(value) {
        // ? 就是 处理 值？ 处理then 返回的promise 的值和 状态
        resolutionProcedure(promise2, value, resolve, reject);
      })
    } else {
      // 返回一个全新的promise 直接执行它的then
      x.then(resolve, reject);
    }
    return;
  }
  
  let called = false;
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then;
      if (typeof then === 'funciton') {
        then.call(
          x,
          y => {
            if (called) {
              return;
            }
            called = true;
            resolutionProcedure(promise2, y, resolve, reject);
          },
          e => {
            if (called) {
              return;
            }
            called = true;
            reject(e);
          }
        )
      } else {
        // 如果 x 为对象
        resolve(x);
      }
    } catch(e) {
      if (called) {
        return;
      } 
      called = true;
      reject(e);
    }
  } else {
    // 如果 x 为基础类型
    resolve(x);
  }
}










// new Promise((resolve, reject) =>{
//   console.log('1111');
//   resolve(
//     new Promise((resolve, reject) => {
//       console.log('----22222');
//       setTimeout(() => {
//         console.log('-----33333'); 
//         resolve(123)
//       });
//     })
//       .then(res => {
//         console.log('----4444', res);
//         return '777'
//       })
//   )
// })
//   .then(res => {
//     console.log('-------5555', res);
//   })
new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(10);
  }, 5000);
}).then(res => {
  console.log('result data', res);
}).then()