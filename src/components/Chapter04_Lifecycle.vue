<script setup>
import { ref, onMounted, onUpdated, onUnmounted, onBeforeMount } from 'vue'

const logs = ref([])
const count = ref(0)
const showChild = ref(true)

function addLog(msg) {
  const time = new Date().toLocaleTimeString()
  logs.value.push(`[${time}] ${msg}`)
}

onBeforeMount(() => addLog('onBeforeMount：组件挂载前，DOM 还不存在'))
onMounted(() => addLog('onMounted：组件已挂载，可以访问 DOM'))
onUpdated(() => addLog(`onUpdated：组件更新了，count = ${count.value}`))
onUnmounted(() => addLog('onUnmounted：组件已卸载'))

// 子组件用于演示 unmounted
const ChildLifecycle = {
  setup() {
    const { onMounted, onUnmounted } = Vue
    onMounted(() => logs.value.push('  ↳ 子组件 onMounted'))
    onUnmounted(() => logs.value.push('  ↳ 子组件 onUnmounted'))
    return {}
  },
  template: `<div class="child-box">子组件（销毁它观察 onUnmounted）</div>`
}
</script>

<template>
  <div class="demo-page">

    <section class="demo-block">
      <h3>Vue 3 生命周期钩子</h3>
      <div class="lifecycle-chart">
        <div class="lc-item setup">setup()</div>
        <div class="lc-arrow">↓</div>
        <div class="lc-item before">onBeforeMount</div>
        <div class="lc-arrow">↓</div>
        <div class="lc-item mounted">onMounted ← 最常用，发请求、操作DOM</div>
        <div class="lc-arrow">↓ 数据变化时</div>
        <div class="lc-item updated">onUpdated</div>
        <div class="lc-arrow">↓ 组件销毁时</div>
        <div class="lc-item unmounted">onUnmounted ← 清理定时器、取消订阅</div>
      </div>
    </section>

    <section class="demo-block">
      <h3>实时观察生命周期</h3>
      <div class="controls">
        <button @click="count++">触发 onUpdated（count +1 = {{ count }}）</button>
        <button @click="showChild = !showChild">
          {{ showChild ? '销毁' : '创建' }}子组件
        </button>
        <button @click="logs = []">清空日志</button>
      </div>
      <ChildLifecycle v-if="showChild" />
      <ul class="log">
        <li v-for="(log, i) in logs" :key="i">{{ log }}</li>
        <li v-if="!logs.length" style="color:#aaa">刷新页面后操作，观察日志</li>
      </ul>
    </section>

    <section class="demo-block">
      <h3>onMounted 常见用法</h3>
      <pre class="code-preview">
onMounted(async () => {
  // 1. 发起数据请求
  const data = await fetchUserList()

  // 2. 操作 DOM（需要 ref 引用）
  inputRef.value.focus()

  // 3. 初始化第三方库（图表、地图等）
  chart.init(chartRef.value)
})</pre>
    </section>

  </div>
</template>

<script>
// 让子组件能访问 Vue（内联组件写法的限制）
import * as Vue from 'vue'
window.Vue = Vue
</script>

<style scoped>
.demo-page { display: flex; flex-direction: column; gap: 24px; }
.demo-block { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.demo-block h3 { font-size: 15px; color: #42b883; margin-bottom: 12px; }
.lifecycle-chart { display: flex; flex-direction: column; gap: 4px; }
.lc-item { padding: 8px 14px; border-radius: 6px; font-size: 13px; font-family: monospace; }
.lc-arrow { font-size: 12px; color: #999; padding-left: 14px; }
.setup { background: #e8f5e9; color: #2e7d32; }
.before { background: #fff3e0; color: #e65100; }
.mounted { background: #e3f2fd; color: #1565c0; }
.updated { background: #f3e5f5; color: #6a1b9a; }
.unmounted { background: #fce4ec; color: #880e4f; }
.controls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.child-box { padding: 10px 14px; background: #f0faf5; border: 1px dashed #42b883; border-radius: 6px; margin-bottom: 10px; font-size: 14px; }
.log { padding-left: 0; list-style: none; font-family: monospace; font-size: 13px; max-height: 200px; overflow-y: auto; background: #1a1a2e; color: #42b883; padding: 12px; border-radius: 6px; }
.log li { margin: 3px 0; }
.code-preview { background: #1a1a2e; color: #a8d8a8; padding: 14px; border-radius: 6px; font-size: 13px; line-height: 1.6; overflow-x: auto; }
button { padding: 6px 14px; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
button:hover { background: #33a06f; }
</style>
