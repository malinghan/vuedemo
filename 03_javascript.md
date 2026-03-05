# 03 · JavaScript — 网页的大脑

> 类比：JavaScript 是网页的**神经系统**。
> HTML 是骨架，CSS 是皮肤，JS 是让网页能"动起来、响应你"的大脑和神经。

**学习目标**
- [ ] 掌握变量、类型、运算符
- [ ] 理解函数、作用域、闭包
- [ ] 熟练使用数组和对象方法
- [ ] 掌握 Promise / async/await
- [ ] 会操作 DOM 和处理事件

**预计学习时长**：7 天（重点章节）

---

## 1. 变量与数据类型

### 类比：不同类型的储物柜

变量是一个**贴了标签的储物柜**，不同类型的数据放不同的柜子。

```
let name = "Tom"     → 文字柜（string）
let age  = 18        → 数字柜（number）
let done = true      → 开关柜（boolean）
let user = null      → 空柜（null，主动设为空）
let x    = undefined → 未分配柜（undefined，没赋值）
let obj  = { }       → 大储物间（object，可放多个东西）
let arr  = [ ]       → 排列整齐的格子（array）
```

**var / let / const 的区别：**

```
var（不推荐）
├── 函数作用域（不是块作用域）
├── 有变量提升（声明前可访问，值为 undefined）
└── 可重复声明

let（变量，推荐）
├── 块作用域 { }
├── 无变量提升（声明前访问报错）
└── 不可重复声明

const（常量，推荐）
├── 块作用域
├── 声明时必须赋值
└── 基本类型不可修改；对象/数组的内容可修改，引用不可变
```

```javascript
// 类型检测
typeof "hello"      // "string"
typeof 42           // "number"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object"  ← 历史遗留 bug，null 不是 object
typeof            // "object"
typeof []           // "object"  ← 数组也是 object
typeof function(){} // "function"

// 判断数组用 Array.isArray
Array.isArray([])   // true

// 类型转换
Number("42")        // 42
Number("")          // 0
Number("abc")       // NaN（Not a Number）
String(42)          // "42"
Boolean(0)          // false
Boolean("")         // false
Boolean(null)       // false
Boolean(undefined)  // false
Boolean(NaN)        // false
// 以上5个是 falsy，其余都是 truthy
```

---

## 2. 函数

### 类比：食谱

函数是一份**食谱**：定义好步骤（函数体），需要时按食谱做（调用），每次可以用不同食材（参数）。

```
函数声明（有提升，可在定义前调用）：
function 函数名(参数) { 函数体; return 结果; }

函数表达式（无提升）：
const 函数名 = function(参数) { ... }

箭头函数（ES6，简洁，无自己的 this）：
const 函数名 = (参数) => 结果
const 函数名 = (参数) => { 多行; return 结果; }
```

```javascript
// 默认参数
function greet(name = "朋友") {
  return `你好，${name}！`
}
greet()        // "你好，朋友！"
greet("Tom")   // "你好，Tom！"

// 剩余参数（收集多余参数为数组）
function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0)
}
sum(1, 2, 3, 4)  // 10

// 解构参数
function showUser({ name, age = 18 }) {
  console.log(`${name}, ${age}岁`)
}
showUser({ name: "Tom", age: 20 })
```

---

## 3. 作用域与闭包

### 类比：俄罗斯套娃

作用域就像**套娃**：内层可以访问外层的变量，外层不能访问内层的变量。

```
全局作用域（最外层套娃）
├── let globalVar = "全局"
│
└── function outer() {          ← 外层套娃
    │   let outerVar = "外层"
    │
    └── function inner() {      ← 内层套娃
            let innerVar = "内层"
            // 可以访问：innerVar、outerVar、globalVar
        }
        // 只能访问：outerVar、globalVar
        // 不能访问：innerVar
    }
    // 只能访问：globalVar
```

**闭包（Closure）：**

### 类比：背包

闭包就是函数带着一个**背包**，背包里装着它被创建时所在作用域的变量，即使外层函数已经执行完毕，背包里的变量依然存在。

```javascript
function makeCounter() {
  let count = 0          // 这个变量被"装进背包"
  return function() {
    count++
    return count
  }
}

const counter = makeCounter()
counter()  // 1
counter()  // 2
counter()  // 3
// count 变量没有消失，被闭包保持着

// 实际应用：防抖函数
function debounce(fn, delay) {
  let timer = null       // timer 被闭包保持
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
const search = debounce((keyword) => fetchResults(keyword), 300)
```

---

## 4. 数组方法（重点）

### 类比：流水线工厂

数组方法就像工厂流水线：原材料（数组）进去，经过各种加工，出来成品。

```
原数组 [1, 2, 3, 4, 5]
    │
    ├── .filter(x => x > 2)    → 筛选机  → [3, 4, 5]
    │
    ├── .map(x => x * 2)       → 加工机  → [2, 4, 6, 8, 10]
    │
    ├── .reduce((a,b) => a+b)  → 压缩机  → 15
    │
    └── .find(x => x > 3)      → 探测器  → 4（第一个满足的）
```

```javascript
const arr = [1, 2, 3, 4, 5]

// forEach：遍历（无返回值）
arr.forEach((item, index) => console.log(index, item))

// map：映射，返回新数组（长度不变）
arr.map(x => x * 2)              // [2, 4, 6, 8, 10]
arr.map(x => ({ value: x }))     // [{value:1}, ...]

// filter：过滤，返回满足条件的新数组
arr.filter(x => x % 2 === 0)     // [2, 4]

// find / findIndex：找第一个满足条件的元素/索引
arr.find(x => x > 3)             // 4
arr.findIndex(x => x > 3)        // 3

// reduce：归并（最强大，可实现其他所有方法）
arr.reduce((acc, x) => acc + x, 0)  // 15（求和）
arr.reduce((acc, x) => acc * x, 1)  // 120（求积）

// some / every：判断
arr.some(x => x > 4)             // true（有一个满足）
arr.every(x => x > 0)            // true（全部满足）

// includes：是否包含
arr.includes(3)                  // true

// sort：排序（注意：修改原数组！）
[3,1,2].sort((a, b) => a - b)    // [1, 2, 3] 升序
[3,1,2].sort((a, b) => b - a)    // [3, 2, 1] 降序

// flat：展平嵌套数组
[1, [2, [3]]].flat(Infinity)     // [1, 2, 3]

// 链式调用（最常用！）
const result = [1,2,3,4,5]
  .filter(x => x % 2 !== 0)     // [1, 3, 5]
  .map(x => x * 10)             // [10, 30, 50]
  .reduce((a, b) => a + b, 0)   // 90
```

---

## 5. 对象操作

### 类比：档案柜

对象是一个**档案柜**，每个抽屉（属性）有名字（key）和内容（value）。

```javascript
const user = { name: "Tom", age: 18, city: "Beijing" }

// 解构赋值（最常用！）
const { name, age } = user
const { name: userName, age: userAge = 20 } = user  // 重命名 + 默认值

// 展开运算符
const newUser = { ...user, email: "tom@mail.com" }  // 浅拷贝 + 新增属性
const updated = { ...user, age: 20 }                // 覆盖属性

// 常用方法
Object.keys(user)     // ["name", "age", "city"]
Object.values(user)   // ["Tom", 18, "Beijing"]
Object.entries(user)  // [["name","Tom"], ["age",18], ...]

// 遍历对象
Object.entries(user).forEach(([key, value]) => {
  console.log(`${key}: ${value}`)
})

// 可选链（?.）：避免访问 undefined 属性时报错
const street = user?.address?.street  // undefined（不报错）
const city   = user?.address?.city ?? "未知"  // "未知"（空值合并）
```

---

## 6. Promise 与异步

### 类比：外卖订单

同步代码像**堂食**：你站在柜台等，做好了才给你，期间什么都干不了。
异步代码像**外卖**：下单后你可以干别的，做好了通知你。

```
同步（阻塞）：
你 → 下单 → 等待... → 等待... → 拿到餐 → 继续其他事

异步（非阻塞）：
你 → 下单 → 继续干其他事 → （餐好了）→ 处理结果
```

**Promise 状态机：**

```
                  ┌─────────────┐
                  │   pending   │  ← 等待中（初始状态）
                  └──────┬──────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       ┌─────────────┐       ┌─────────────┐
       │  fulfilled  │       │  rejected   │
       │  （成功）    │       │  （失败）    │
       └──────┬──────┘       └──────┬──────┘
              │                     │
              ▼                     ▼
           .then()               .catch()
```

```javascript
// 创建 Promise
const fetchUser = (id) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (id > 0) resolve({ id, name: "Tom" })
    else reject(new Error("ID 无效"))
  }, 1000)
})

// .then 链式调用
fetchUser(1)
  .then(user => user.name)
  .then(name => console.log(name))
  .catch(err => console.error(err.message))
  .finally(() => console.log("请求结束"))

// async/await（推荐，更像同步代码）
async function loadUser(id) {
  try {
    const user = await fetchUser(id)
    console.log(user.name)
  } catch (err) {
    console.error(err.message)
  }
}

// 并发请求（同时发，等全部完成）
const [user, posts] = await Promise.all([
  fetchUser(1),
  fetchPosts(1)
])

// 竞速（谁先完成用谁）
const result = await Promise.race([
  fetchFromServer1(),
  fetchFromServer2()
])
```

---

## 7. DOM 操作

### 类比：遥控器

DOM 操作就是用 JavaScript 这个**遥控器**，控制页面上的每个元素（电视机的各个功能）。

```
JavaScript
    │
    │  document.querySelector()
    ▼
  DOM 节点（元素）
    │
    ├── 读/写内容：.textContent  .innerHTML
    ├── 读/写属性：.getAttribute()  .setAttribute()
    ├── 读/写样式：.style.xxx  .classList
    └── 事件监听：.addEventListener()
```

```javascript
// 查找元素
const el  = document.querySelector(".card")       // 第一个匹配
const els = document.querySelectorAll(".card")    // 所有匹配（NodeList）

// 读写内容
el.textContent = "纯文本"                          // 安全，不解析 HTML
el.innerHTML   = "<strong>HTML内容</strong>"       // 解析 HTML（注意 XSS）

// 读写属性
el.getAttribute("href")
el.setAttribute("data-id", "123")
el.dataset.id  // 读取 data-id 属性

// 操作 class
el.classList.add("active")
el.classList.remove("active")
el.classList.toggle("active")
el.classList.contains("active")  // true/false

// 创建和插入元素
const div = document.createElement("div")
div.textContent = "新元素"
div.className = "card"
document.body.appendChild(div)
el.insertAdjacentHTML("beforeend", "<p>插入HTML</p>")

// 删除元素
el.remove()
```

---

## 8. 事件处理

### 类比：门铃系统

事件就像**门铃**：有人按（触发事件），门铃响（执行回调函数）。

**事件冒泡：**

```
点击 <button>
    │
    ▼  事件从目标元素向上冒泡
<button> → <div> → <main> → <body> → <html> → document → window

e.stopPropagation()  ← 阻止继续冒泡
e.preventDefault()   ← 阻止默认行为（如链接跳转、表单提交）
```

```javascript
// 基础事件监听
el.addEventListener("click", (e) => {
  console.log(e.target)        // 实际点击的元素
  console.log(e.currentTarget) // 绑定监听器的元素
})

// 常用事件
el.addEventListener("click",      handler)  // 点击
el.addEventListener("dblclick",   handler)  // 双击
el.addEventListener("mouseenter", handler)  // 鼠标进入（不冒泡）
el.addEventListener("mouseleave", handler)  // 鼠标离开（不冒泡）
el.addEventListener("keydown",    handler)  // 键盘按下
el.addEventListener("keyup",      handler)  // 键盘抬起
el.addEventListener("input",      handler)  // 输入框内容变化
el.addEventListener("change",     handler)  // 值改变（失焦后）
el.addEventListener("submit",     handler)  // 表单提交
el.addEventListener("scroll",     handler)  // 滚动
el.addEventListener("resize",     handler)  // 窗口大小变化（window上）

// 事件委托（性能优化：不给每个子元素绑定，只绑定父元素）
document.querySelector("ul").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    console.log("点击了：", e.target.textContent)
  }
})
```

---

## 9. ES6+ 常用特性速查

```javascript
// 模板字符串
const msg = `你好，${name}！今年 ${age} 岁。`

// 解构赋值
const [a, b, ...rest] = [1, 2, 3, 4, 5]  // a=1, b=2, rest=[3,4,5]
const { x, y, ...others } = obj

// 展开运算符
const arr2 = [...arr1, 4, 5]
const obj2 = { ...obj1, key: "value" }

// 短路求值
const name = user && user.name          // user 存在才取 name
const city = user.city || "未知城市"    // city 为 falsy 时用默认值
const val  = data ?? "默认"             // 只有 null/undefined 才用默认值

// 可选链
const zip = user?.address?.zipCode

// 模块化
export const PI = 3.14
export default function add(a, b) { return a + b }
import add, { PI } from "./math.js"

// Class
class Animal {
  #name  // 私有属性
  constructor(name) { this.#name = name }
  speak() { return `${this.#name} 叫了` }
}
class Dog extends Animal {
  speak() { return super.speak() + "（汪汪）" }
}
```

---

## 10. 综合练习

### 练习 1：Todo List（必做）

实现完整的待办事项：
- 添加任务（回车或点击按钮）
- 标记完成（点击切换状态）
- 删除任务
- 过滤（全部/未完成/已完成）
- localStorage 持久化

### 练习 2：数据请求展示（必做）

```javascript
// 用这个免费 API 练习
fetch("https://jsonplaceholder.typicode.com/users")
  .then(res => res.json())
  .then(users => {
    // 渲染用户列表到页面
  })
```

### 练习 3：防抖搜索（进阶）

输入框实时搜索，用防抖避免频繁请求。

---

## 自测题

- [ ] `==` 和 `===` 的区别？
- [ ] 什么是闭包？举一个实际应用场景
- [ ] `Promise.all` 和 `Promise.race` 的区别？
- [ ] 事件冒泡是什么？如何阻止？
- [ ] `null` 和 `undefined` 的区别？
- [ ] 箭头函数和普通函数的 `this` 有什么不同？

---

## 学习资源

| 资源 | 链接 | 说明 |
|------|------|------|
| MDN JavaScript | https://developer.mozilla.org/zh-CN/docs/Web/JavaScript | 最权威参考 |
| JavaScript.info | https://zh.javascript.info/ | 最好的中文 JS 教程 |
| ES6 入门教程 | https://es6.ruanyifeng.com/ | 阮一峰，免费在线 |
| 《JS高级程序设计》 | 书籍 | 红宝书，必读经典 |
| Codewars | https://www.codewars.com/ | 刷题练习 |

---

> 完成后把 `INDEX.md` 里 `03_javascript.md` 的 `☐` 改为 `✅`
>
> 下一步 → `04_toolchain.md`
