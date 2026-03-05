<script setup>
import { ref } from 'vue'

// 子组件：接收 props + 发出事件
const ChildDemo = {
  props: {
    title: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  emits: ['increment', 'reset'],
  template: `
    <div class="child-box">
      <p>子组件收到 title：<strong>{{ title }}</strong></p>
      <p>子组件收到 count：<strong>{{ count }}</strong></p>
      <button @click="$emit('increment')">子组件触发 increment</button>
      <button @click="$emit('reset')">子组件触发 reset</button>
    </div>
  `
}

const parentCount = ref(0)
const parentTitle = ref('来自父组件的标题')

// 插槽示例组件
const CardSlot = {
  template: `
    <div class="slot-card">
      <div class="slot-header"><slot name="header">默认标题</slot></div>
      <div class="slot-body"><slot>默认内容</slot></div>
      <div class="slot-footer"><slot name="footer" /></div>
    </div>
  `
}
</script>

<template>
  <div class="demo-page">

    <section class="demo-block">
      <h3>1. Props — 父传子</h3>
      <p>父组件数据：title = "{{ parentTitle }}"，count = {{ parentCount }}</p>
      <input v-model="parentTitle" placeholder="修改 title" />
      <ChildDemo :title="parentTitle" :count="parentCount" @increment="parentCount++" @reset="parentCount = 0" />
      <p class="tip">父组件通过 <code>:prop</code> 传值，子组件通过 <code>$emit</code> 向上通知</p>
    </section>

    <section class="demo-block">
      <h3>2. 自定义事件 — 子传父</h3>
      <p>父组件 count 当前值：<strong>{{ parentCount }}</strong></p>
      <p>点击子组件的按钮，父组件的 count 会变化</p>
    </section>

    <section class="demo-block">
      <h3>3. 插槽 Slot</h3>
      <CardSlot>
        <template #header>
          <span style="color:#42b883; font-weight:bold">自定义标题插槽</span>
        </template>
        <p>这是默认插槽的内容，可以放任意 HTML</p>
        <template #footer>
          <small style="color:#999">底部插槽内容</small>
        </template>
      </CardSlot>
      <p class="tip">插槽让组件更灵活，父组件可以自定义子组件内部的内容</p>
    </section>

  </div>
</template>

<style scoped>
.demo-page { display: flex; flex-direction: column; gap: 24px; }
.demo-block { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.demo-block h3 { font-size: 15px; color: #42b883; margin-bottom: 12px; }
.tip { margin-top: 8px; padding: 8px 12px; background: #f0faf5; border-left: 3px solid #42b883; border-radius: 4px; font-size: 13px; }
.child-box { margin-top: 12px; padding: 14px; background: #f8f8ff; border: 1px dashed #42b883; border-radius: 6px; }
.child-box p { margin: 4px 0; font-size: 14px; }
.slot-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin-top: 12px; }
.slot-header { padding: 10px 16px; background: #f5f5f5; border-bottom: 1px solid #eee; }
.slot-body { padding: 14px 16px; }
.slot-footer { padding: 8px 16px; background: #fafafa; border-top: 1px solid #eee; }
input { padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; margin-bottom: 10px; }
button { padding: 6px 14px; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-top: 8px; margin-right: 6px; }
button:hover { background: #33a06f; }
code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
</style>
