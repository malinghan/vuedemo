# 05 · Vue 基础 — 模板语法与指令

> 类比：Vue 是一个**智能模板引擎**。
> 你写模板（HTML + 特殊语法），Vue 自动把数据填进去，数据变了页面自动更新。

**学习目标**
- [ ] 理解 Vue 的声明式渲染
- [ ] 掌握插值、指令、事件绑定
- [ ] 会用 v-if / v-for / v-model
- [ ] 理解响应式更新原理

**预计学习时长**：2 天

---

## 1. Vue 是什么

### 类比：Excel 的公式

在 Excel 里，你在 B1 写 `=A1*2`，A1 改了 B1 自动更新。
Vue 就是网页版的 Excel：数据（A1）变了，页面（B1）自动更新。

```
传统 JS（命令式）：
data.count = 10
document.querySelector('#count').textContent = data.count  ← 手动更新 DOM
data.count = 20
document.querySelector('#count').textContent = data.count  ← 又要手动更新

Vue（声明式）：
<div>{{ count }}</div>  ← 声明"这里显示 count"
count.value = 10        ← Vue 自动更新 DOM
count.value = 20        ← Vue 自动更新 DOM
```

---

## 2. 创建 Vue 应用

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

```vue
<!-- App.vue -->
<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue!')
const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <h1>{{ message }}</h1>
  <p>Count: {{ count }}</p>
  <button @click="increment">+1</button>
</template>

<style scoped>
h1 { color: #42b883; }
</style>
```

**单文件组件（SFC）结构：**

```
┌─────────────────────────────────────┐
│  <script setup>                     │  ← JavaScript 逻辑
│    import { ref } from 'vue'        │
│    const count = ref(0)             │
│  </script>                          │
├─────────────────────────────────────┤
│  <template>                         │  ← HTML 模板
│    <div>{{ count }}</div>           │
│  </template>                        │
├─────────────────────────────────────┤
│  <style scoped>                     │  ← CSS 样式（scoped 只作用于当前组件）
│    div { color: red; }              │
│  </style>                           │
└─────────────────────────────────────┘
```

---

## 3. 插值与表达式

### 类比：填空题

`{{ }}` 就是模板里的**填空**，Vue 把数据填进去。

```vue
<script setup>
const name = ref('Tom')
const age = ref(18)
const user = ref({ name: 'Tom', city: 'Beijing' })
</script>

<template>
  <!-- 文本插值 -->
  <p>{{ name }}</p>
  <p>{{ age }}</p>

  <!-- 表达式（可以运算） -->
  <p>{{ age + 10 }}</p>
  <p>{{ age > 18 ? '成年' : '未成年' }}</p>
  <p>{{ name.toUpperCase() }}</p>

  <!-- 对象属性 -->
  <p>{{ user.name }} 来自 {{ user.city }}</p>

  <!-- ❌ 不能写语句 -->
  <p>{{ if (age > 18) { return '成年' } }}</p>  <!-- 错误！ -->
  <p>{{ let x = 1 }}</p>                        <!-- 错误！ -->
</template>
```

---

## 4. 指令（Directives）

### 类比：特殊指令牌

指令是 Vue 的**特殊属性**，以 `v-` 开头，告诉 Vue"这个元素要特殊处理"。

```
v-bind   → 绑定属性（简写 :）
v-on     → 绑定事件（简写 @）
v-if     → 条件渲染（DOM 中移除）
v-show   → 条件显示（display:none）
v-for    → 列表渲染
v-model  → 双向绑定
```

### 4.1 v-bind — 属性绑定

```vue
<script setup>
const imgUrl = ref('/logo.png')
const isActive = ref(true)
const fontSize = ref(16)
</script>

<template>
  <!-- 绑定 src -->
  <img v-bind:src="imgUrl" />
  <img :src="imgUrl" />  <!-- 简写 -->

  <!-- 绑定 class -->
  <div :class="{ active: isActive }">动态 class</div>
  <div :class="['card', { active: isActive }]">多个 class</div>

  <!-- 绑定 style -->
  <div :style="{ fontSize: fontSize + 'px', color: 'red' }">动态样式</div>

  <!-- 绑定多个属性 -->
  <input :type="inputType" :placeholder="placeholder" :disabled="isDisabled" />
</template>
```

**class 绑定图解：**

```
:class="{ active: true, disabled: false }"
    │
    ▼
<div class="active"></div>

:class="['card', 'shadow']"
    │
    ▼
<div class="card shadow"></div>

:class="['card', { active: isActive }]"
    │  isActive = true
    ▼
<div class="card active"></div>
```

### 4.2 v-on — 事件绑定

```vue
<script setup>
const count = ref(0)

function increment() {
  count.value++
}

function handleClick(event) {
  console.log('点击了', event.target)
}

function greet(name) {
  alert(`你好，${name}！`)
}
</script>

<template>
  <!-- 基础用法 -->
  <button v-on:click="increment">+1</button>
  <button @click="increment">+1</button>  <!-- 简写 -->

  <!-- 传参 -->
  <button @click="greet('Tom')">打招呼</button>

  <!-- 访问事件对象 -->
  <button @click="handleClick">点击</button>
  <button @click="(e) => handleClick(e)">点击</button>

  <!-- 事件修饰符 -->
  <form @submit.prevent="onSubmit">  <!-- 阻止默认行为 -->
  <div @click.stop="onClick">        <!-- 阻止冒泡 -->
  <a @click.prevent.stop="onClick">  <!-- 链式调用 -->

  <!-- 按键修饰符 -->
  <input @keyup.enter="submit" />    <!-- 回车时触发 -->
  <input @keyup.esc="cancel" />      <!-- ESC 时触发 -->
</template>
```

### 4.3 v-if / v-show — 条件渲染

```vue
<script setup>
const isLoggedIn = ref(false)
const userType = ref('admin')
</script>

<template>
  <!-- v-if：条件为 false 时，元素不在 DOM 中 -->
  <div v-if="isLoggedIn">欢迎回来！</div>
  <div v-else>请登录</div>

  <!-- v-else-if -->
  <div v-if="userType === 'admin'">管理员</div>
  <div v-else-if="userType === 'user'">普通用户</div>
  <div v-else>游客</div>

  <!-- v-show：条件为 false 时，display: none -->
  <div v-show="isLoggedIn">欢迎回来！</div>
</template>
```

**v-if vs v-show：**

```
v-if（条件渲染）
├── false 时元素不在 DOM 中
├── 切换开销大（销毁/重建）
└── 适合不频繁切换的场景

v-show（条件显示）
├── false 时 display: none
├── 切换开销小（只改 CSS）
└── 适合频繁切换的场景
```

### 4.4 v-for — 列表渲染

```vue
<script setup>
const items = ref(['苹果', '香蕉', '橙子'])
const users = ref([
  { id: 1, name: 'Tom', age: 18 },
  { id: 2, name: 'Jerry', age: 20 }
])
</script>

<template>
  <!-- 遍历数组 -->
  <ul>
    <li v-for="(item, index) in items" :key="index">
      {{ index }}. {{ item }}
    </li>
  </ul>

  <!-- 遍历对象数组（必须有 :key） -->
  <div v-for="user in users" :key="user.id">
    {{ user.name }} - {{ user.age }}岁
  </div>

  <!-- 遍历对象 -->
  <div v-for="(value, key) in { name: 'Tom', age: 18 }" :key="key">
    {{ key }}: {{ value }}
  </div>

  <!-- 遍历数字 -->
  <span v-for="n in 5" :key="n">{{ n }}</span>  <!-- 1 2 3 4 5 -->
</template>
```

**为什么需要 :key？**

```
没有 key：
[A, B, C]  →  删除 B  →  [A, C]
Vue 不知道删了谁，可能复用错误

有 key：
[A:1, B:2, C:3]  →  删除 B:2  →  [A:1, C:3]
Vue 知道删了 B，精确复用 A 和 C
```

### 4.5 v-model — 双向绑定

```vue
<script setup>
const text = ref('')
const checked = ref(false)
const selected = ref('')
const multiSelect = ref([])
</script>

<template>
  <!-- 文本输入 -->
  <input v-model="text" />
  <p>你输入了：{{ text }}</p>

  <!-- 多行文本 -->
  <textarea v-model="text"></textarea>

  <!-- 复选框 -->
  <input type="checkbox" v-model="checked" />
  <p>{{ checked ? '已选中' : '未选中' }}</p>

  <!-- 单选框 -->
  <input type="radio" value="male" v-model="selected" /> 男
  <input type="radio" value="female" v-model="selected" /> 女

  <!-- 下拉选择 -->
  <select v-model="selected">
    <option value="">请选择</option>
    <option value="bj">北京</option>
    <option value="sh">上海</option>
  </select>

  <!-- 多选 -->
  <select v-model="multiSelect" multiple>
    <option value="vue">Vue</option>
    <option value="react">React</option>
  </select>

  <!-- 修饰符 -->
  <input v-model.number="age" />      <!-- 自动转数字 -->
  <input v-model.trim="text" />       <!-- 自动去首尾空格 -->
  <input v-model.lazy="text" />       <!-- 失焦时才更新 -->
</template>
```

**v-model 原理：**

```vue
<!-- v-model 是语法糖 -->
<input v-model="text" />

<!-- 等价于 -->
<input :value="text" @input="text = $event.target.value" />
```

---

## 5. 综合练习

### 练习 1：Todo List（必做）

实现功能：
- 输入框添加任务（回车或点击按钮）
- 点击任务切换完成状态
- 删除任务
- 显示未完成数量

### 练习 2：表单验证（必做）

用户注册表单：
- 用户名（3-20位）
- 邮箱（格式验证）
- 密码（至少8位）
- 实时显示错误提示

### 练习 3：动态样式（进阶）

点击按钮切换主题（深色/浅色），用 `:class` 和 `:style` 实现。

---

## 自测题

- [ ] `{{ }}` 里可以写什么？不能写什么？
- [ ] `v-if` 和 `v-show` 的区别？
- [ ] 为什么 `v-for` 必须有 `:key`？
- [ ] `v-model` 的原理是什么？
- [ ] `@click.prevent` 和 `@click.stop` 分别做什么？

---

## 学习资源

| 资源 | 链接 | 说明 |
|------|------|------|
| Vue 3 官方文档 | https://cn.vuejs.org/ | 最权威 |
| Vue SFC Playground | https://play.vuejs.org/ | 在线运行 Vue |
| Vue Mastery | https://www.vuemastery.com/ | 视频教程（英文） |

---

> 完成后把 `INDEX.md` 里 `05_vue_basics.md` 的 `☐` 改为 `✅`
>
> 下一步 → `06_vue_reactivity.md`
