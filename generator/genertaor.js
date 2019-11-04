/**
 * @description generator 实现
 */


function generator(cb) {
  return (function() {
    var obj = {
      next: 0,
      stop: function() {}
    }

    return {
      next: function() {
        var ret = cb(object);
        if (ret === undefined) {
          return {
            value: undefined,
            done: true
          };
        }
        return {
          value: ret,
          done: true
        };
      }
    }
  })();
}

// 再使用生成器函数
function test() {
  var a;
  return generator(function(_content) {
    while(1) {
      switch (_content.pre = _content.next) {
        case 0:
          a = 1 + 2;
          _content.next = 4;
          return 2;
        case 4:
          _content.next = 6;
          return 3;
        case 6:
        case 'end':
          return _content.stop();
      }
    }
  })
}



// 使用
function * test() {
  let a = yield 2;
  console.log( 'a:',a);
  let b = yield a + 3;
  console.log( 'b', b);
}

let result = test();
let c = result.next(2);
console.log( 'c', c);

let d = result.next(3);
console.log( 'd', d);


function generator(cb) {
  return (function() {
    var obj = {
      next: 0,
    }
  })();
}
