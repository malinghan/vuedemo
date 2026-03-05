# HTML5 学习教程

## 一、核心概念

### 1. 文档结构（Document Structure）
HTML 文档是一棵树形结构，浏览器解析后生成 DOM 树。

```
HTML 文档
├── DOCTYPE 声明
└── <html>
    ├── <head>（元信息：标题、样式、脚本）
    └── <body>（可见内容）
```

### 2. 语义化标签（Semantic Elements）
用有意义的标签描述内容，而不是全用 `<div>`。

**为什么重要：**
- 提升可读性，代码更易维护
- 有利于 SEO（搜索引擎更好理解页面结构）
- 无障碍访问（屏幕阅读器依赖语义）

### 3. 块级元素 vs 行内元素
- **块级（Block）**：独占一行，可设置宽高 → `<div>` `<p>` `<h1>` `<section>`
- **行内（Inline）**：不换行，宽高由内容决定 → `<span>` `<a>` `<strong>` `<img>`
- **行内块（Inline-block）**：不换行，但可设置宽高 → `<button>` `<input>`

### 4. 表单（Form）
用于收集用户输入，是前端与后端交互的主要方式。

### 5. HTML5 新特性
- 语义化标签（header、nav、main、article 等）
- 表单增强（新 input 类型、验证属性）
- 多媒体（audio、video）
- 图形（canvas、svg）
- 本地存储（localStorage、sessionStorage）
- Web API（Geolocation、WebSocket 等）

---

## 二、概念流程图

### 2.1 浏览器解析 HTML 的流程

```
HTML 文本
    │
    ▼
词法分析（Tokenization）
    │  将字符流解析为 Token（开始标签、结束标签、文本等）
    ▼
构建 DOM 树
    │  Token → Node → DOM Tree
    ▼
构建 CSSOM 树
    │  解析 CSS，生成样式规则树
    ▼
合并为渲染树（Render Tree）
    │  只包含可见节点
    ▼
布局（Layout / Reflow）
    │  计算每个节点的位置和大小
    ▼
绘制（Paint）
    │  将节点绘制到屏幕
    ▼
用户看到页面
```

### 2.2 HTML 文档结构

```
<!DOCTYPE html>
└── <html lang="zh">
    ├── <head>
    │   ├── <meta charset="UTF-8">
    │   ├── <meta name="viewport" ...>
    │   ├── <title>页面标题</title>
    │   └── <link rel="stylesheet" href="style.css">
    └── <body>
        ├── <header>          ← 页头
        │   └── <nav>         ← 导航
        ├── <main>            ← 主内容（页面唯一）
        │   ├── <article>     ← 独立内容
        │   └── <aside>       ← 侧边栏
        └── <footer>          ← 页脚
```

### 2.3 语义化标签使用场景

```
页面布局
├── <header>  → 页头、文章头部
├── <nav>     → 导航菜单
├── <main>    → 页面主体（唯一）
│   ├── <article> → 博客文章、新闻、评论
│   ├── <section> → 主题性内容分组
│   └── <aside>   → 侧边栏、广告、相关链接
└── <footer>  → 页脚、版权信息

文本内容
├── <h1>~<h6> → 标题层级（h1 最重要，页面唯一）
├── <p>       → 段落
├── <strong>  → 重要内容（加粗，有语义）
├── <em>      → 强调内容（斜体，有语义）
├── <time>    → 时间日期
└── <mark>    → 高亮文本

列表
├── <ul> + <li>  → 无序列表（导航、功能列表）
├── <ol> + <li>  → 有序列表（步骤、排名）
└── <dl> + <dt> + <dd> → 定义列表（术语解释）

媒体
├── <img>    → 图片
├── <video>  → 视频
├── <audio>  → 音频
└── <figure> + <figcaption> → 图文组合
```

### 2.4 表单数据流

```
用户填写表单
    │
    ▼
前端验证（HTML5 原生 / JavaScript）
    │  required、pattern、minlength 等
    ▼
用户提交（点击 submit 按钮）
    │
    ▼
表单事件触发（submit event）
    │
    ├── 阻止默认提交（e.preventDefault()）
    │
    ▼
JavaScript 处理数据
    │  收集表单数据、格式化、加密等
    ▼
发送请求到服务器（fetch / axios）
    │
    ▼
服务器响应
    │
    ▼
更新页面（成功提示 / 错误提示）
```

---

## 三、演示代码

### 3.1 完整页面结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="页面描述，用于 SEO">
  <title>HTML5 示例页面</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- 页头 -->
  <header>
    <div class="logo">MyBlog</div>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/articles">文章</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>

  <!-- 主内容 -->
  <main>
    <!-- 文章 -->
    <article>
      <header>
        <h1>HTML5 语义化标签详解</h1>
        <p>作者：<strong>Tom</strong> | 发布时间：<time datetime="2024-01-15">2024年1月15日</time></p>
      </header>

      <section>
        <h2>什么是语义化？</h2>
        <p>语义化是指使用<em>有意义的标签</em>来描述内容结构...</p>
      </section>

      <section>
        <h2>常用语义化标签</h2>
        <ul>
          <li><code>&lt;header&gt;</code> - 页头</li>
          <li><code>&lt;nav&gt;</code> - 导航</li>
          <li><code>&lt;main&gt;</code> - 主内容</li>
        </ul>
      </section>

      <footer>
        <p>标签：<mark>HTML5</mark> <mark>语义化</mark></p>
      </footer>
    </article>

    <!-- 侧边栏 -->
    <aside>
      <h3>相关文章</h3>
      <ul>
        <li><a href="#">CSS3 新特性</a></li>
        <li><a href="#">JavaScript ES6</a></li>
      </ul>
    </aside>
  </main>

  <!-- 页脚 -->
  <footer>
    <p>&copy; 2024 MyBlog. All rights reserved.</p>
  </footer>

</body>
</html>
```

### 3.2 语义化 vs 非语义化对比

```html
<!-- ❌ 非语义化写法 -->
<div id="header">
  <div id="logo">MyBlog</div>
  <div id="nav">
    <div class="nav-item"><a href="/">首页</a></div>
  </div>
</div>
<div id="content">
  <div class="post">
    <div class="post-title">文章标题</div>
    <div class="post-body">文章内容...</div>
  </div>
</div>
<div id="footer">版权信息</div>

<!-- ✅ 语义化写法 -->
<header>
  <div class="logo">MyBlog</div>
  <nav>
    <a href="/">首页</a>
  </nav>
</header>
<main>
  <article>
    <h1>文章标题</h1>
    <p>文章内容...</p>
  </article>
</main>
<footer>版权信息</footer>
```

### 3.3 HTML5 表单增强

```html
<form id="registerForm" novalidate>

  <!-- 文本输入 -->
  <div class="form-group">
    <label for="username">用户名</label>
    <input
      type="text"
      id="username"
      name="username"
      required
      minlength="3"
      maxlength="20"
      pattern="[a-zA-Z0-9_]+"
      placeholder="3-20位字母、数字或下划线"
    />
  </div>

  <!-- 邮箱（自动验证格式） -->
  <div class="form-group">
    <label for="email">邮箱</label>
    <input type="email" id="email" name="email" required placeholder="example@mail.com" />
  </div>

  <!-- 密码 -->
  <div class="form-group">
    <label for="password">密码</label>
    <input type="password" id="password" name="password" required minlength="8" />
  </div>

  <!-- 数字范围 -->
  <div class="form-group">
    <label for="age">年龄：<span id="ageVal">18</span></label>
    <input type="range" id="age" name="age" min="1" max="100" value="18"
           oninput="document.getElementById('ageVal').textContent = this.value" />
  </div>

  <!-- 日期选择 -->
  <div class="form-group">
    <label for="birthday">生日</label>
    <input type="date" id="birthday" name="birthday" />
  </div>

  <!-- 颜色选择 -->
  <div class="form-group">
    <label for="color">喜欢的颜色</label>
    <input type="color" id="color" name="color" value="#42b883" />
  </div>

  <!-- 下拉选择 -->
  <div class="form-group">
    <label for="city">城市</label>
    <select id="city" name="city" required>
      <option value="">请选择城市</option>
      <option value="beijing">北京</option>
      <option value="shanghai">上海</option>
      <option value="guangzhou">广州</option>
    </select>
  </div>

  <!-- 多选框 -->
  <div class="form-group">
    <label>兴趣爱好</label>
    <label><input type="checkbox" name="hobby" value="coding"> 编程</label>
    <label><input type="checkbox" name="hobby" value="reading"> 阅读</label>
    <label><input type="checkbox" name="hobby" value="gaming"> 游戏</label>
  </div>

  <!-- 单选框 -->
  <div class="form-group">
    <label>性别</label>
    <label><input type="radio" name="gender" value="male"> 男</label>
    <label><input type="radio" name="gender" value="female"> 女</label>
  </div>

  <!-- 文本域 -->
  <div class="form-group">
    <label for="bio">个人简介</label>
    <textarea id="bio" name="bio" rows="4" maxlength="200" placeholder="介绍一下自己..."></textarea>
  </div>

  <button type="submit">注册</button>
</form>

<script>
document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault()  // 阻止默认提交行为

  // 收集表单数据
  const formData = new FormData(this)
  const data = Object.fromEntries(formData.entries())
  console.log('表单数据：', data)

  // 这里可以发送请求到服务器
  // fetch('/api/register', { method: 'POST', body: JSON.stringify(data) })
})
</script>
```

### 3.4 HTML5 多媒体

```html
<!-- 视频 -->
<video
  width="640"
  height="360"
  controls
  autoplay
  muted
  loop
  poster="thumbnail.jpg"
>
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
  您的浏览器不支持 video 标签
</video>

<!-- 音频 -->
<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  您的浏览器不支持 audio 标签
</audio>

<!-- 图文组合 -->
<figure>
  <img src="photo.jpg" alt="风景照片" width="400">
  <figcaption>图1：美丽的风景</figcaption>
</figure>
```

### 3.5 Canvas 画布

```html
<canvas id="myCanvas" width="400" height="200" style="border:1px solid #ddd"></canvas>

<script>
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

// 绘制矩形
ctx.fillStyle = '#42b883'
ctx.fillRect(10, 10, 150, 80)

// 绘制圆形
ctx.beginPath()
ctx.arc(250, 100, 60, 0, Math.PI * 2)
ctx.fillStyle = '#ff6b6b'
ctx.fill()

// 绘制文字
ctx.font = '20px Arial'
ctx.fillStyle = '#333'
ctx.fillText('Hello Canvas!', 10, 170)

// 绘制线条
ctx.beginPath()
ctx.moveTo(10, 190)
ctx.lineTo(390, 190)
ctx.strokeStyle = '#999'
ctx.lineWidth = 2
ctx.stroke()
</script>
```

### 3.6 本地存储

```javascript
// localStorage：永久存储（除非手动清除）
localStorage.setItem('username', 'Tom')
localStorage.setItem('settings', JSON.stringify({ theme: 'dark', lang: 'zh' }))

const username = localStorage.getItem('username')           // 'Tom'
const settings = JSON.parse(localStorage.getItem('settings'))  // { theme: 'dark', lang: 'zh' }

localStorage.removeItem('username')  // 删除单项
localStorage.clear()                 // 清空所有

// sessionStorage：会话存储（关闭标签页后清除）
sessionStorage.setItem('token', 'abc123')
const token = sessionStorage.getItem('token')

// 实际应用：记住用户偏好
function saveTheme(theme) {
  localStorage.setItem('theme', theme)
  document.body.className = theme
}

function loadTheme() {
  const theme = localStorage.getItem('theme') || 'light'
  document.body.className = theme
}

// 页面加载时恢复主题
loadTheme()
```

### 3.7 综合练习：个人名片页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>个人名片</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }

    .card {
      background: #fff;
      border-radius: 16px;
      padding: 32px;
      width: 360px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #42b883;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin: 0 auto 16px;
    }

    h1 { font-size: 22px; color: #333; margin-bottom: 4px; }
    .title { color: #42b883; font-size: 14px; margin-bottom: 16px; }

    .info { text-align: left; margin: 16px 0; }
    .info-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555; }

    .tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 16px 0; }
    .tag { padding: 4px 12px; background: #f0faf5; color: #42b883; border-radius: 20px; font-size: 12px; }

    .btn { display: inline-block; padding: 10px 28px; background: #42b883; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; transition: background 0.2s; }
    .btn:hover { background: #33a06f; }
  </style>
</head>
<body>

  <article class="card">
    <div class="avatar">👨‍💻</div>
    <h1>张小明</h1>
    <p class="title">前端开发工程师</p>

    <section class="info">
      <div class="info-item">📍 北京市朝阳区</div>
      <div class="info-item">📧 xiaoming@example.com</div>
      <div class="info-item">🎓 计算机科学与技术</div>
      <div class="info-item">💼 3年工作经验</div>
    </section>

    <div class="tags">
      <span class="tag">Vue 3</span>
      <span class="tag">React</span>
      <span class="tag">TypeScript</span>
      <span class="tag">Node.js</span>
    </div>

    <a href="mailto:xiaoming@example.com" class="btn">联系我</a>
  </article>

</body>
</html>
```

---

## 四、常见错误和注意事项

### 错误 1：忘记 alt 属性
```html
<!-- ❌ 错误 -->
<img src="photo.jpg">

<!-- ✅ 正确 -->
<img src="photo.jpg" alt="风景照片描述">
<!-- 纯装饰图片用空 alt -->
<img src="decoration.png" alt="">
```

### 错误 2：标题层级跳跃
```html
<!-- ❌ 错误：从 h1 跳到 h3 -->
<h1>页面标题</h1>
<h3>子标题</h3>

<!-- ✅ 正确：按层级递进 -->
<h1>页面标题</h1>
<h2>章节标题</h2>
<h3>子章节标题</h3>
```

### 错误 3：在 `<p>` 中嵌套块级元素
```html
<!-- ❌ 错误：p 不能包含块级元素 -->
<p>
  <div>内容</div>
</p>

<!-- ✅ 正确 -->
<div>
  <p>段落内容</p>
</div>
```

### 错误 4：表单 label 没有关联 input
```html
<!-- ❌ 错误：点击 label 不会聚焦 input -->
<label>用户名</label>
<input type="text">

<!-- ✅ 正确：通过 for 和 id 关联 -->
<label for="username">用户名</label>
<input type="text" id="username">
```

---

## 五、自测题

完成以下问题，检验学习效果：

- [ ] `<strong>` 和 `<b>` 有什么区别？
- [ ] `<section>` 和 `<div>` 有什么区别？
- [ ] `<article>` 和 `<section>` 分别用在什么场景？
- [ ] `localStorage` 和 `sessionStorage` 的区别？
- [ ] 为什么 `<img>` 需要 `alt` 属性？
- [ ] 表单的 `action` 和 `method` 属性分别是什么意思？
- [ ] `<input type="submit">` 和 `<button type="submit">` 有什么区别？

---

> 下一步：学习 CSS3 布局，查看 `stage1.md` 中的 CSS 部分
