# 01 · HTML5 — 网页的骨架

> 类比：HTML 是一栋楼的**钢筋混凝土结构**。
> CSS 负责装修，JavaScript 负责电梯和自动门，但没有 HTML 这栋楼根本站不起来。

**学习目标**
- [ ] 理解 HTML 文档结构和 DOM 树
- [ ] 掌握语义化标签的使用场景
- [ ] 会写完整的 HTML5 表单
- [ ] 了解 localStorage / sessionStorage

**预计学习时长**：2 天

---

## 1. HTML 是什么

### 类比：积木说明书

HTML（HyperText Markup Language）不是编程语言，它是一份**说明书**，告诉浏览器"这里放一个标题、那里放一张图片、这块是导航"。

浏览器读完说明书，就把页面搭出来。

```
你写的 HTML 文本
      │
      │  浏览器解析
      ▼
  DOM 树（内存中的树形结构）
      │
      │  渲染引擎绘制
      ▼
  你看到的网页
```

---

## 2. 文档结构

### 类比：一封正式信件

就像信件有固定格式（称呼、正文、落款），HTML 也有固定骨架：

```
┌─────────────────────────────────────┐
│  <!DOCTYPE html>   ← 声明：这是HTML5  │
│  <html>            ← 信封            │
│  ├── <head>        ← 信封背面（元信息）│
│  │   ├── <meta charset>  编码        │
│  │   ├── <title>         标题栏      │
│  │   └── <link>          引入CSS     │
│  └── <body>        ← 信纸（可见内容） │
│      ├── <header>  页头              │
│      ├── <main>    正文              │
│      └── <footer>  页脚              │
└─────────────────────────────────────┘
```

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的第一个网页</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

---

## 3. DOM 树

### 类比：公司组织架构图

DOM（Document Object Model）就是浏览器把 HTML 解析成的一棵**家族树**，每个标签是一个节点，父子关系清晰。

```
              document
                 │
               <html>
              /       \
          <head>      <body>
            │         /    \
         <title>  <header> <main>
            │        │       │
         "网页"    <nav>  <article>
                     │       │
                   <a>     <h1><p>
```

JavaScript 通过这棵树来找到、修改任意元素：

```javascript
// 找到节点
const title = document.querySelector('h1')

// 修改内容
title.textContent = '新标题'

// 修改样式
title.style.color = 'red'
```

---

## 4. 语义化标签

### 类比：图书馆的分区标牌

图书馆不会把所有书堆在一起，而是用标牌标注"科技区""文学区""儿童区"。
语义化标签就是给页面内容贴上**有意义的标牌**，而不是全用 `<div>`。

```
┌──────────────────────────────────────────┐
│                 <header>                  │
│  ┌──────────────────────────────────┐    │
│  │              <nav>               │    │
│  │  首页  |  文章  |  关于  |  联系  │    │
│  └──────────────────────────────────┘    │
├──────────────────────────────────────────┤
│                  <main>                   │
│  ┌─────────────────────┐  ┌──────────┐  │
│  │      <article>      │  │ <aside>  │  │
│  │  ┌───────────────┐  │  │          │  │
│  │  │   <section>   │  │  │ 相关文章 │  │
│  │  │  第一章内容    │  │  │          │  │
│  │  └───────────────┘  │  │ 广告位   │  │
│  │  ┌───────────────┐  │  │          │  │
│  │  │   <section>   │  │  └──────────┘  │
│  │  │  第二章内容    │  │               │
│  │  └───────────────┘  │               │
│  └─────────────────────┘               │
├──────────────────────────────────────────┤
│                 <footer>                  │
│           © 2024 版权所有                 │
└──────────────────────────────────────────┘
```

**标签选择决策树：**

```
这块内容是什么？
    │
    ├── 整个页面的顶部？          → <header>
    ├── 导航链接集合？            → <nav>
    ├── 页面核心内容？            → <main>（整页唯一）
    ├── 可独立发布的内容？         → <article>（文章/评论/卡片）
    ├── 同一主题的内容分组？       → <section>
    ├── 与主内容相关但非核心？     → <aside>（侧边栏）
    ├── 页面底部信息？            → <footer>
    └── 以上都不是，纯布局容器？  → <div>
```

**对比：**

```html
<!-- ❌ div 汤：全是 div，没有任何语义 -->
<div id="header">
  <div id="nav"><div class="item">首页</div></div>
</div>
<div id="main">
  <div class="post"><div class="title">文章</div></div>
</div>

<!-- ✅ 语义化：一眼看出结构 -->
<header>
  <nav><a href="/">首页</a></nav>
</header>
<main>
  <article><h1>文章标题</h1></article>
</main>
```

---

## 5. 块级 vs 行内元素

### 类比：家具 vs 装饰品

- **块级元素**：像沙发、床、桌子——独占一整行，可以设置宽高
- **行内元素**：像相框、台灯——跟着文字流动，宽高由内容决定

```
块级元素（Block）：
┌────────────────────────────────────┐
│  <div>  独占一整行                  │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│  <p>  段落也独占一行                │
└────────────────────────────────────┘

行内元素（Inline）：
文字 <span>行内</span> 文字 <a>链接</a> 文字 <strong>加粗</strong> 继续...
（都在同一行流动）

行内块（Inline-block）：
文字 [  按钮  ] [  按钮  ] 文字  ← 不换行，但可设宽高
```

| 类型 | 代表标签 | 能设宽高？ | 独占一行？ |
|------|---------|-----------|-----------|
| 块级 | `div` `p` `h1` `section` | ✅ | ✅ |
| 行内 | `span` `a` `strong` `em` | ❌ | ❌ |
| 行内块 | `button` `input` `img` | ✅ | ❌ |

---

## 6. 表单

### 类比：纸质申请表

表单就是网页版的**申请表**：用户填写信息，点提交，数据发给服务器。

```
┌─────────────────────────────────────┐
│           用户注册                   │
├─────────────────────────────────────┤
│  用户名：[________________]          │
│  邮  箱：[________________]          │
│  密  码：[················]          │
│  生  日：[  日期选择器    ]          │
│  性  别：( ) 男  ( ) 女             │
│  爱  好：[x] 编程  [ ] 游戏         │
│  城  市：[  下拉选择  ▼]            │
│                                     │
│         [    注  册    ]            │
└─────────────────────────────────────┘
```

**表单数据流：**

```
用户填写
    │
    ▼
HTML5 原生验证（required / pattern / minlength）
    │  验证失败 → 显示错误提示，阻止提交
    │  验证通过 ↓
    ▼
触发 submit 事件
    │
    ▼
e.preventDefault()  ← 阻止页面跳转
    │
    ▼
JS 收集数据（FormData / 手动读取）
    │
    ▼
fetch() 发送到服务器
    │
    ├── 成功 → 跳转 / 提示"注册成功"
    └── 失败 → 显示错误信息
```

```html
<form id="form">
  <!-- type="text" 普通文本 -->
  <input type="text" name="username" required minlength="3" placeholder="用户名">

  <!-- type="email" 自动验证邮箱格式 -->
  <input type="email" name="email" required placeholder="邮箱">

  <!-- type="password" 内容显示为 ● -->
  <input type="password" name="pwd" required minlength="8">

  <!-- type="number" 只能输数字 -->
  <input type="number" name="age" min="1" max="120">

  <!-- type="date" 日期选择器 -->
  <input type="date" name="birthday">

  <!-- type="radio" 单选（同 name 互斥） -->
  <label><input type="radio" name="gender" value="male"> 男</label>
  <label><input type="radio" name="gender" value="female"> 女</label>

  <!-- type="checkbox" 多选 -->
  <label><input type="checkbox" name="hobby" value="code"> 编程</label>

  <!-- select 下拉 -->
  <select name="city">
    <option value="">请选择</option>
    <option value="bj">北京</option>
  </select>

  <button type="submit">注册</button>
</form>

<script>
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault()
  const data = Object.fromEntries(new FormData(e.target))
  console.log(data)
  // fetch('/api/register', { method: 'POST', body: JSON.stringify(data) })
})
</script>
```

---

## 7. 本地存储

### 类比：浏览器的便利贴 vs 白板

- **localStorage**：便利贴——贴上去不会消失，关了浏览器再开还在
- **sessionStorage**：白板——关掉标签页就擦掉了

```
localStorage                    sessionStorage
┌──────────────────┐            ┌──────────────────┐
│  username: "Tom" │            │  token: "abc123" │
│  theme: "dark"   │            │  step: "2"       │
│  lang: "zh"      │            │                  │
│                  │            │  关闭标签页后清空  │
│  永久保存         │            └──────────────────┘
└──────────────────┘
```

```javascript
// 存
localStorage.setItem('theme', 'dark')
localStorage.setItem('user', JSON.stringify({ name: 'Tom', age: 18 }))

// 取
const theme = localStorage.getItem('theme')           // 'dark'
const user  = JSON.parse(localStorage.getItem('user')) // { name: 'Tom', age: 18 }

// 删
localStorage.removeItem('theme')
localStorage.clear()  // 清空全部

// 实战：记住用户主题偏好
function applyTheme() {
  const saved = localStorage.getItem('theme') || 'light'
  document.body.dataset.theme = saved
}
applyTheme()  // 页面加载时立即执行
```

---

## 8. 综合练习

### 练习 1：个人主页（必做）

用语义化标签搭建一个个人主页，包含：
- `<header>` 含导航
- `<main>` 含自我介绍 `<article>` 和技能列表 `<section>`
- `<footer>` 含联系方式

### 练习 2：注册表单（必做）

实现一个注册表单，要求：
- 用户名（3-20位，只允许字母数字下划线）
- 邮箱（格式验证）
- 密码（至少8位）
- 提交后用 `console.log` 打印数据

### 练习 3：主题切换（进阶）

实现一个深色/浅色主题切换按钮，用 `localStorage` 记住用户选择，刷新页面后保持。

---

## 自测题

- [ ] `<article>` 和 `<section>` 的区别是什么？
- [ ] 为什么 `<img>` 必须有 `alt` 属性？
- [ ] `localStorage` 和 `sessionStorage` 什么时候数据会消失？
- [ ] 表单提交时为什么要 `e.preventDefault()`？
- [ ] `<strong>` 和 `<b>` 有什么区别？（提示：语义 vs 样式）

---

## 学习资源

| 资源 | 链接 | 说明 |
|------|------|------|
| MDN HTML 参考 | https://developer.mozilla.org/zh-CN/docs/Web/HTML | 最权威，查标签必备 |
| HTML5 标签速查 | https://htmlreference.io/ | 可视化展示每个标签 |
| W3Schools HTML | https://www.w3schools.com/html/ | 有在线运行环境 |
| 语义化实践指南 | https://web.dev/learn/html/ | Google 出品，质量高 |

---

> 下一步 → [02 · CSS3 — 网页的皮肤](./02_css3.md)
