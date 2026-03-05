# 第一阶段：前端基础强化教程

> 根据你的情况：HTML/CSS 基本了解，JavaScript 需要复习
> 重点放在 HTML5 新特性、CSS 布局进阶、JavaScript 系统复习

---

## 一、HTML5 进阶

### 1.1 语义化标签

语义化让代码更易读，也有利于 SEO 和无障碍访问。

```html
<!-- 非语义化写法 -->
<div id="header">...</div>
<div id="nav">...</div>
<div id="content">...</div>

<!-- 语义化写法 -->
<header>...</header>
<nav>...</nav>
<main>
  <article>...</article>
  <aside>...</aside>
</main>
<footer>...</footer>
```

常用语义化标签：

| 标签 | 用途 |
|------|------|
| `<header>` | 页头或区块头部 |
| `<nav>` | 导航链接 |
| `<main>` | 页面主内容（唯一） |
| `<article>` | 独立内容块（文章、帖子） |
| `<section>` | 主题性内容分组 |
| `<aside>` | 侧边栏、附属内容 |
| `<footer>` | 页脚或区块底部 |

### 1.2 表单增强

```html
<form>
  <!-- 新增 input 类型 -->
  <input type="email" placeholder="邮箱" required>
  <input type="tel" placeholder="手机号">
  <input type="number" min="0" max="100" step="1">
  <input type="date">
  <input type="range" min="0" max="100">
  <input type="color">

  <!-- 表单验证属性 -->
  <input type="text" required minlength="2" maxlength="20" pattern="[A-Za-z]+">

  <button type="submit">提交</button>
</form>
```

### 1.3 HTML5 新 API（了解即可，Vue 学习中会用到）

```html
<!-- Canvas 画布 -->
<canvas id="myCanvas" width="400" height="200"></canvas>
<script>
  const canvas = document.getElementById('myCanvas')
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#4CAF50'
  ctx.fillRect(10, 10, 150, 100)
</script>

<!-- 本地存储 -->
<script>
  localStorage.setItem('username', 'Tom')
  const name = localStorage.getItem('username')
  localStorage.removeItem('username')
</script>
```

---

## 二、CSS3 布局进阶

### 2.1 Flexbox 弹性布局

Flexbox 是最常用的布局方式，必须熟练掌握。

```css
/* 父容器属性 */
.container {
  display: flex;
  flex-direction: row;        /* 主轴方向：row | column */
  justify-content: center;    /* 主轴对齐：flex-start | center | flex-end | space-between | space-around */
  align-items: center;        /* 交叉轴对齐：flex-start | center | flex-end | stretch */
  flex-wrap: wrap;            /* 换行：nowrap | wrap */
  gap: 16px;                  /* 子元素间距 */
}

/* 子元素属性 */
.item {
  flex: 1;                    /* 等分剩余空间 */
  flex-grow: 1;               /* 放大比例 */
  flex-shrink: 0;             /* 不缩小 */
  flex-basis: 200px;          /* 初始大小 */
  align-self: flex-end;       /* 单独设置交叉轴对齐 */
}
```

**常用布局场景：**

```css
/* 水平垂直居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 导航栏：左logo + 右菜单 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 等宽列布局 */
.columns {
  display: flex;
  gap: 20px;
}
.columns > * {
  flex: 1;
}
```

### 2.2 Grid 网格布局

适合二维布局（行和列同时控制）。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3列等宽 */
  grid-template-rows: auto;
  gap: 20px;
}

/* 不等宽列 */
.grid-2 {
  display: grid;
  grid-template-columns: 200px 1fr;       /* 左固定 + 右自适应 */
}

/* 子元素跨列 */
.item-wide {
  grid-column: 1 / 3;   /* 从第1列到第3列 */
}
```

### 2.3 响应式设计

```css
/* 移动优先 */
.container {
  width: 100%;
  padding: 0 16px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
    margin: 0 auto;
  }
}

/* 桌面 */
@media (min-width: 1200px) {
  .container {
    max-width: 1200px;
  }
}

/* 常用断点 */
/* xs: < 576px  手机竖屏 */
/* sm: >= 576px 手机横屏 */
/* md: >= 768px 平板 */
/* lg: >= 992px 桌面 */
/* xl: >= 1200px 大屏 */
```

### 2.4 CSS 变量和常用技巧

```css
/* CSS 变量（自定义属性） */
:root {
  --primary-color: #4CAF50;
  --font-size-base: 16px;
  --border-radius: 8px;
}

.button {
  background: var(--primary-color);
  font-size: var(--font-size-base);
  border-radius: var(--border-radius);
}

/* 过渡动画 */
.button {
  transition: all 0.3s ease;
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

---

## 三、JavaScript 系统复习

> 这是你的重点，需要系统过一遍

### 3.1 变量和数据类型

```javascript
// var（不推荐）、let（变量）、const（常量）
let name = 'Tom'
const age = 18
const PI = 3.14

// 7种基本类型
typeof 'hello'      // 'string'
typeof 42           // 'number'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof null         // 'object'（历史遗留bug）
typeof Symbol()     // 'symbol'
typeof 42n          // 'bigint'

// 引用类型
typeof {}           // 'object'
typeof []           // 'object'
typeof function(){} // 'function'

// 类型转换
Number('42')        // 42
String(42)          // '42'
Boolean(0)          // false（0、''、null、undefined、NaN 都是 false）
```

### 3.2 函数

```javascript
// 函数声明（有提升）
function add(a, b) {
  return a + b
}

// 函数表达式（无提升）
const multiply = function(a, b) {
  return a * b
}

// 箭头函数（ES6，无自己的 this）
const divide = (a, b) => a / b

// 默认参数
function greet(name = '朋友') {
  return `你好，${name}！`
}

// 剩余参数
function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0)
}
sum(1, 2, 3, 4)  // 10
```

### 3.3 数组常用方法（重点）

```javascript
const arr = [1, 2, 3, 4, 5]

// 遍历
arr.forEach(item => console.log(item))

// 映射（返回新数组）
arr.map(item => item * 2)           // [2, 4, 6, 8, 10]

// 过滤（返回新数组）
arr.filter(item => item > 2)        // [3, 4, 5]

// 查找
arr.find(item => item > 3)          // 4（第一个满足的元素）
arr.findIndex(item => item > 3)     // 3（索引）

// 归并
arr.reduce((acc, item) => acc + item, 0)  // 15

// 判断
arr.some(item => item > 4)          // true（有一个满足）
arr.every(item => item > 0)         // true（全部满足）
arr.includes(3)                     // true

// 排序（注意：会修改原数组）
[3,1,2].sort((a, b) => a - b)       // [1, 2, 3] 升序

// 展开和合并
[...arr, 6, 7]                      // [1,2,3,4,5,6,7]
arr.concat([6, 7])                  // [1,2,3,4,5,6,7]
[1,[2,[3]]].flat(Infinity)          // [1,2,3]
```

### 3.4 对象操作

```javascript
const user = { name: 'Tom', age: 18, city: 'Beijing' }

// 解构赋值
const { name, age } = user
const { name: userName, age: userAge = 20 } = user  // 重命名 + 默认值

// 展开运算符
const newUser = { ...user, email: 'tom@example.com' }

// 常用方法
Object.keys(user)     // ['name', 'age', 'city']
Object.values(user)   // ['Tom', 18, 'Beijing']
Object.entries(user)  // [['name','Tom'], ['age',18], ['city','Beijing']]

// 合并对象
Object.assign({}, user, { age: 20 })

// 可选链（避免报错）
const street = user?.address?.street  // undefined（不报错）

// 空值合并
const city = user.city ?? '未知城市'
```

### 3.5 Promise 和异步（重点）

```javascript
// Promise 基础
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: 'success' })
      // reject(new Error('failed'))
    }, 1000)
  })
}

// .then 链式调用
fetchData()
  .then(result => console.log(result))
  .catch(err => console.error(err))
  .finally(() => console.log('完成'))

// async/await（推荐写法）
async function getData() {
  try {
    const result = await fetchData()
    console.log(result)
  } catch (err) {
    console.error(err)
  }
}

// 并发请求
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts()
])
```

### 3.6 ES6+ 模块化

```javascript
// 导出
export const PI = 3.14
export function add(a, b) { return a + b }
export default class Calculator { ... }

// 导入
import Calculator from './calculator.js'
import { PI, add } from './math.js'
import * as math from './math.js'
```

### 3.7 DOM 操作复习

```javascript
// 查找元素
document.getElementById('app')
document.querySelector('.btn')          // 第一个匹配
document.querySelectorAll('.item')      // 所有匹配（NodeList）

// 修改内容
el.textContent = '文本内容'
el.innerHTML = '<span>HTML内容</span>'

// 修改样式
el.style.color = 'red'
el.classList.add('active')
el.classList.remove('active')
el.classList.toggle('active')

// 事件监听
el.addEventListener('click', (e) => {
  e.preventDefault()    // 阻止默认行为
  e.stopPropagation()   // 阻止冒泡
  console.log(e.target) // 触发事件的元素
})

// 事件委托（性能优化）
document.querySelector('ul').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log(e.target.textContent)
  }
})
```

---

## 四、练习项目

完成以下小项目来巩固基础：

### 练习1：个人名片页面
- 用语义化 HTML 搭建结构
- 用 Flexbox 实现布局
- 添加 hover 动画效果

### 练习2：待办事项（Todo List）
- 输入框添加任务
- 点击完成/删除任务
- 用 localStorage 持久化数据
- 练习 DOM 操作和事件处理

### 练习3：简单的数据请求
- 用 fetch + async/await 请求公开 API
- 将数据渲染到页面
- 处理 loading 和 error 状态

```javascript
// 推荐练习用的免费 API
// https://jsonplaceholder.typicode.com/todos
// https://jsonplaceholder.typicode.com/users

async function loadUsers() {
  const res = await fetch('https://jsonplaceholder.typicode.com/users')
  const users = await res.json()
  // 渲染到页面...
}
```

---

## 五、进入 Vue 学习的前置检查

在开始 Vue 之前，确保你能回答以下问题：

- [ ] 什么是事件冒泡？如何阻止？
- [ ] `==` 和 `===` 的区别？
- [ ] 什么是闭包？举个例子
- [ ] Promise 和 async/await 怎么用？
- [ ] 数组的 `map`、`filter`、`reduce` 分别做什么？
- [ ] 什么是解构赋值？
- [ ] `let`、`const`、`var` 的区别？

全部能回答 → 可以开始学 Vue 了！

---

> 下一步：查看 `前端学习路线.md` 了解完整路线，然后开始 Vue 学习之旅
