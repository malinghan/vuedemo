<script setup>
import { ref } from 'vue'
import Chapter01 from '../../components/Chapter01_Basics.vue'
import Chapter02 from '../../components/Chapter02_Reactivity.vue'
import Chapter03 from '../../components/Chapter03_Components.vue'
import Chapter04 from '../../components/Chapter04_Lifecycle.vue'
import Chapter05 from '../../components/Chapter05_CompositionAPI.vue'

const demos = [
  { id: 1, title: '模板语法与指令', desc: '文本插值、条件渲染、列表渲染、事件绑定', component: Chapter01 },
  { id: 2, title: '响应式数据', desc: 'ref / reactive / computed / watch 实时演示', component: Chapter02 },
  { id: 3, title: '组件通信', desc: 'Props 传值、Emit 事件、provide/inject', component: Chapter03 },
  { id: 4, title: '生命周期', desc: '各生命周期钩子的触发时机演示', component: Chapter04 },
  { id: 5, title: 'Composition API', desc: '组合式 API 与自定义 Hook 演示', component: Chapter05 },
]

const current = ref(1)
const currentDemo = () => demos.find(d => d.id === current.value)
</script>

<template>
  <div class="demo-page-wrap">
    <div class="page-header">
      <h1>Vue 3 演示案例</h1>
      <p>可交互的实时代码演示，边看边练</p>
    </div>

    <div class="demo-tabs">
      <button
        v-for="d in demos"
        :key="d.id"
        :class="['tab', { active: current === d.id }]"
        @click="current = d.id"
      >
        {{ d.title }}
      </button>
    </div>

    <div class="demo-container">
      <div class="demo-header">
        <h2>{{ currentDemo().title }}</h2>
        <p>{{ currentDemo().desc }}</p>
      </div>
      <component :is="currentDemo().component" />
    </div>
  </div>
</template>

<style scoped>
.demo-page-wrap {
  padding: 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 28px;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.page-header p {
  color: #888;
  font-size: 14px;
}

.demo-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 18px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.15s;
}

.tab:hover {
  border-color: #42b883;
  color: #42b883;
}

.tab.active {
  background: #42b883;
  border-color: #42b883;
  color: #fff;
}

.demo-container {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.demo-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #42b883;
}

.demo-header h2 {
  font-size: 22px;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.demo-header p {
  font-size: 14px;
  color: #999;
}
</style>
