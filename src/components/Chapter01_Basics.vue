<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue 3!')
const isVisible = ref(true)
const count = ref(0)
const items = ref(['苹果', '香蕉', '橙子'])
const newItem = ref('')
const inputVal = ref('')
</script>

<template>
  <div class="demo-page">

    <section class="demo-block">
      <h3>1. 文本插值 {{ }}</h3>
      <p>message = <code>{{ message }}</code></p>
      <input v-model="message" placeholder="修改 message" />
    </section>

    <section class="demo-block">
      <h3>2. v-if / v-show 条件渲染</h3>
      <button @click="isVisible = !isVisible">切换显示</button>
      <p v-if="isVisible" class="tip">v-if：我被销毁/重建（DOM 中不存在）</p>
      <p v-show="isVisible" class="tip">v-show：我只是 display:none（DOM 中存在）</p>
    </section>

    <section class="demo-block">
      <h3>3. v-for 列表渲染</h3>
      <ul>
        <li v-for="(item, index) in items" :key="index">
          {{ index + 1 }}. {{ item }}
        </li>
      </ul>
      <div class="row">
        <input v-model="newItem" placeholder="添加新项目" @keyup.enter="items.push(newItem); newItem = ''" />
        <button @click="items.push(newItem); newItem = ''">添加</button>
      </div>
    </section>

    <section class="demo-block">
      <h3>4. v-bind 属性绑定</h3>
      <p>动态绑定 class 和 style：</p>
      <div :class="{ highlight: count > 3 }" :style="{ fontSize: (14 + count) + 'px' }">
        字体大小随 count 变化（count = {{ count }}）
      </div>
      <button @click="count++">count + 1</button>
      <button @click="count = 0">重置</button>
    </section>

    <section class="demo-block">
      <h3>5. v-model 双向绑定</h3>
      <input v-model="inputVal" placeholder="输入内容..." />
      <p>你输入了：<strong>{{ inputVal || '（空）' }}</strong></p>
    </section>

  </div>
</template>

<style scoped>
.demo-page { display: flex; flex-direction: column; gap: 24px; }
.demo-block { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.demo-block h3 { font-size: 15px; color: #42b883; margin-bottom: 12px; }
.tip { margin-top: 8px; padding: 8px 12px; background: #f0faf5; border-left: 3px solid #42b883; border-radius: 4px; }
.row { display: flex; gap: 8px; margin-top: 8px; }
input { padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
button { padding: 6px 14px; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-top: 8px; margin-right: 6px; }
button:hover { background: #33a06f; }
ul { padding-left: 20px; margin: 8px 0; }
li { margin: 4px 0; }
.highlight { color: #e74c3c; font-weight: bold; }
code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
</style>
