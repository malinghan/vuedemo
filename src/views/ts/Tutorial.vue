<script setup>
import { ref, onMounted } from 'vue'
import MarkdownViewer from '../../components/MarkdownViewer.vue'

const chapters = [
  { id: 1, file: 'chapter01.md', title: '认识 TypeScript 与环境准备' },
  { id: 2, file: 'chapter02.md', title: '基础类型' },
  { id: 3, file: 'chapter03.md', title: '函数与对象类型' },
  { id: 4, file: 'chapter04.md', title: '联合类型与类型缩小' },
  { id: 5, file: 'chapter05.md', title: '泛型' },
  { id: 6, file: 'chapter06.md', title: '高级类型工具' },
  { id: 7, file: 'chapter07.md', title: '类与面向对象' },
  { id: 8, file: 'chapter08.md', title: '模块与声明文件' },
  { id: 9, file: 'chapter09.md', title: 'Vue3 + TS 核心写法' },
  { id: 10, file: 'chapter10.md', title: 'Vue3 组件类型设计' },
  { id: 11, file: 'chapter11.md', title: '工程化与迁移策略' },
  { id: 12, file: 'chapter12.md', title: '综合案例实战' },
]

const current = ref(1)
const content = ref('')
const loading = ref(false)

async function loadChapter(id) {
  const ch = chapters.find(c => c.id === id)
  if (!ch) return
  loading.value = true
  try {
    const res = await fetch(`/ts/chapters/${ch.file}`)
    content.value = await res.text()
  } catch (e) {
    content.value = '加载失败，请确认文件存在。'
  }
  loading.value = false
}

function selectChapter(id) {
  current.value = id
  loadChapter(id)
}

onMounted(() => loadChapter(1))
</script>

<template>
  <div class="ts-tutorial">
    <div class="page-header">
      <h1>TypeScript 教程</h1>
      <p>12 个章节，从基础类型到 Vue3 + TS 综合实战</p>
    </div>

    <div class="layout">
      <aside class="chapter-nav">
        <button
          v-for="c in chapters"
          :key="c.id"
          :class="['ch-btn', { active: current === c.id }]"
          @click="selectChapter(c.id)"
        >
          <span class="ch-num">{{ String(c.id).padStart(2, '0') }}</span>
          <span class="ch-title">{{ c.title }}</span>
        </button>
      </aside>

      <div class="chapter-body">
        <div v-if="loading" class="loading">加载中...</div>
        <MarkdownViewer v-else :content="content" accent-color="#3178c6" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ts-tutorial {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
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

.layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.chapter-nav {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.ch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: none;
  cursor: pointer;
  font-size: 12.5px;
  color: #666;
  text-align: left;
  transition: all 0.15s;
}

.ch-btn:hover {
  background: #f0f7ff;
  color: #3178c6;
}

.ch-btn.active {
  background: #3178c6;
  color: #fff;
}

.ch-num {
  font-family: monospace;
  font-size: 11px;
  opacity: 0.6;
  flex-shrink: 0;
}

.ch-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-body {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  padding: 36px 40px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.loading {
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 15px;
}
</style>
