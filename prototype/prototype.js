// 在规范里， prototype 被定义为：给其他对象提供共享属性的对象
// 也就是说，prototype 自己也是对象，只是被用以承担某个职能罢了。


// prototype chain 原型链
// 原型链的概念 仅仅是在原型这个概念基础上所做的直接推论
// 既然 prototype 只是恰好作为另一个对象的隐式引用的普通对象， 那么他也是对象， 也符合一个对象那个的基本特征
// 也就是说， prototype 对象也有自己的隐式引用， 有自己的 prototype 对象
// 如此，构成了兑现过得原型的原型的原型的链条，知道某个对象的隐式引用为 null, 整个链条终止


// 通过覆盖 Object.prototype.__proto__ 我们可以看到，访问普通对象的 __proto__ 触发了 Object.prototype 上的 __proto__ 的 get 方法。

// 因此，普通对象创建时，只需要将它内部的隐式引用指向 Object.prototype 对象，就能兼容 __proto__ 属性访问行为，不需要将原型隐式挂载到对象的 __proto__ 属性。


// 两类原型继承方式

// 显式跟隐式的差别：是否由开发者亲自操作。
// 1 显示原型继承
const obj_a = {
	a: 1
}
const obj_b = {
	b: 1
}
Object.setPrototypeOf(obj_b, obj_a);
Reflect.setPrototypeOf(obj_a, obj_b);

// 还以通过 Object.create 直接继承另一个对象

// Object.setPropertyOf 和 Object.create 的差别在于：

// 1）Object.setPropertyOf，给我两个对象，我把其中一个设置为另一个的原型。

// 2）Object.create，给我一个对象，它将作为我创建的新对象的原型

// 2 隐式原型继承
// 使用构造函数的方式 创建对象
function User(name) {
	this.name = name;
}
const user = new User('tom');

user.constructor === User  // true

// 实现new 
const newF = (cb) => (...args) => {
	let obj = Object.create(cb.prototype);
	let result =  cb.apply(obj, args);
	if (result && (typeof result === 'function' || typeof result === 'object')) {
		return result;
	} else {
		return obj
	}
}


let cc = newF(User)('william');

// 简单实现 Object.create
function create(proto) {
	let Noop = function() {};
	Noop.prototype = proto;
	return new Noop();
}

// 显示继承方式  properties 是 class 或者带有 constructor 的属性
const inherit = (SuperConstructor, properties) => {
	const { constructor } = properties;
	

	SubConstrutor = function (...args) {
		SuperConstructor.call(this, ...args);
		constructor.call(this, ...args);
	}

	SubConstrutor.prototype = {
		...properties,
		constructor: SubConstrutor
	}

	// linking !!!链接 子 构造函数的原型是 父构造函数的原型
	Reflect.setPrototypeOf(
		SubConstrutor.prototype,
		SuperConstructor.prototype
	)

	return SubConstrutor;
}

// 使用方式类似类
const Human = inherit(Object, {
	constructor( { age }) {
		this.age = age;
	},
	showAge() {
		console.log('age', this.age);
	}
})

const User = inherit(Human, {
	constructor({ firstName, lastName}) {
		this.firstName = firstName,
		this.lastName = lastName;
	},
	showName() {
		console.log( this,'name:', this.firstName, this.lastName);
	}
})

const user = new User({
	age: 18,
	firstName: 'william',
	lastName: 'zhang'
})

console.log('user', user);


// 从数据结构和算法的角度理解 prototype 和 class