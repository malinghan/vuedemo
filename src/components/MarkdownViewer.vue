<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  content: { type: String, default: '' },
  accentColor: { type: String, default: '#3178c6' }
})

const emit = defineEmits(['navigate'])

const showBackTop = ref(false)

function onScroll() {
  showBackTop.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const renderedHtml = computed(() => {
  if (!props.content) return ''
  return renderMarkdown(props.content)
})

function renderMarkdown(md) {
  let html = md

  // 1) 代码块 —— 最先处理，用占位符保护内容
  const codeBlocks = []
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = escapeHtml(code.trimEnd())
    const highlighted = highlightCode(escaped, lang)
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : ''
    const placeholder = `%%CODEBLOCK_${codeBlocks.length}%%`
    codeBlocks.push(`<pre class="code-block">${langLabel}<code class="lang-${lang || 'text'}">${highlighted}</code></pre>`)
    return placeholder
  })

  // 2) 行内代码 —— 需要转义 HTML 实体
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    return `<code class="inline-code">${escapeHtml(code)}</code>`
  })

  // 3) 表格 —— 宽松匹配：允许行尾有无空格，最后一行可以没有尾部换行
  html = html.replace(/^\|(.+)\|[ \t]*\n\|[-| :]+\|[ \t]*\n((?:\|.+\|[ \t]*\n?)*)/gm, (match, header, body) => {
    const ths = header.split('|').map(h => h.trim()).filter(Boolean)
      .map(h => `<th>${h}</th>`).join('')
    const bodyTrimmed = body.trim()
    if (!bodyTrimmed) return `<table class="md-table"><thead><tr>${ths}</tr></thead><tbody></tbody></table>\n`
    const rows = bodyTrimmed.split('\n').map(row => {
      const tds = row.replace(/^\||\|$/g, '').split('|')
        .map(c => `<td>${c.trim()}</td>`).join('')
      return `<tr>${tds}</tr>`
    }).join('')
    return `<table class="md-table"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>\n`
  })

  // 4) 标题
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')

  // 5) 粗体 / 斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // 6) 分割线
  html = html.replace(/^---$/gm, '<hr class="md-hr" />')

  // 7) 链接 [text](url) —— 在引用处理之前
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    // 章节内导航链接（./chapterXX.md）转为点击事件
    const chapterMatch = href.match(/\.\/(?:chapter(\d+)\.md|(\d+_\w+\.md))/)
    if (chapterMatch) {
      const id = chapterMatch[1] || chapterMatch[2]
      return `<a href="#" class="md-nav-link" data-chapter="${id}">${text}</a>`
    }
    // 外部链接
    return `<a href="${href}" target="_blank" rel="noopener" class="md-link">${text}</a>`
  })

  // 8) 引用
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="md-quote">$1</blockquote>')
  html = html.replace(/^> (.+)$/gm, '<blockquote class="md-quote">$1</blockquote>')

  // 9) 无序列表
  html = html.replace(/^- \[ \] (.+)$/gm, '<div class="md-checkbox">☐ $1</div>')
  html = html.replace(/^- \[x\] (.+)$/gm, '<div class="md-checkbox checked">☑ $1</div>')
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.+<\/li>\n?)+)/g, '<ul class="md-list">$1</ul>')

  // 10) 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ol-item">$1</li>')

  // 11) 段落
  html = html.replace(/^(?!<[a-z/]|%%CODEBLOCK|$)(.+)$/gm, '<p>$1</p>')

  // 12) 还原代码块
  codeBlocks.forEach((block, i) => {
    html = html.replace(`%%CODEBLOCK_${i}%%`, block)
  })

  // 清理多余空行
  html = html.replace(/\n{3,}/g, '\n\n')
  return html
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightCode(code, lang) {
  if (!lang || lang === 'text' || lang === 'mermaid') return code

  let result = code

  // 多行注释
  result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hl-comment">$1</span>')
  // 单行注释
  result = result.replace(/(\/\/.*$|#.*$)/gm, '<span class="hl-comment">$1</span>')
  // HTML 注释
  result = result.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="hl-comment">$1</span>')

  // 字符串
  result = result.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, (match, str, offset) => {
    const before = result.substring(Math.max(0, offset - 100), offset)
    if (before.includes('<span class="hl-comment">') && !before.includes('</span>')) return match
    return `<span class="hl-string">${str}</span>`
  })

  // 关键字
  const keywords = [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'switch', 'case',
    'default', 'for', 'while', 'do', 'break', 'continue', 'new', 'this',
    'class', 'extends', 'implements', 'interface', 'type', 'enum', 'namespace',
    'import', 'export', 'from', 'as', 'async', 'await', 'try', 'catch', 'finally',
    'throw', 'typeof', 'instanceof', 'in', 'of', 'void', 'delete', 'keyof',
    'readonly', 'abstract', 'static', 'public', 'private', 'protected',
    'declare', 'module', 'infer',
    'true', 'false', 'null', 'undefined', 'never', 'any', 'unknown',
    'number', 'string', 'boolean', 'object', 'symbol', 'bigint',
    'ref', 'reactive', 'computed', 'watch', 'watchEffect',
    'onMounted', 'onUnmounted', 'onUpdated', 'onBeforeMount',
    'defineProps', 'defineEmits', 'defineExpose', 'defineSlots', 'withDefaults',
    'provide', 'inject', 'nextTick', 'toRefs', 'toRef',
    'npm', 'npx', 'install',
    'script', 'setup', 'template', 'style', 'lang',
    'strict', 'target',
  ]
  const kwPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g')
  result = result.replace(kwPattern, (match, kw, offset) => {
    const before = result.substring(Math.max(0, offset - 150), offset)
    const lastOpen = before.lastIndexOf('<span')
    const lastClose = before.lastIndexOf('</span>')
    if (lastOpen > lastClose) return match
    return `<span class="hl-keyword">${kw}</span>`
  })

  // 数字
  result = result.replace(/\b(\d+\.?\d*)\b/g, (match, num, offset) => {
    const before = result.substring(Math.max(0, offset - 150), offset)
    const lastOpen = before.lastIndexOf('<span')
    const lastClose = before.lastIndexOf('</span>')
    if (lastOpen > lastClose) return match
    return `<span class="hl-number">${num}</span>`
  })

  // 类型名（大写开头）
  result = result.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, (match, name, offset) => {
    const before = result.substring(Math.max(0, offset - 150), offset)
    const lastOpen = before.lastIndexOf('<span')
    const lastClose = before.lastIndexOf('</span>')
    if (lastOpen > lastClose) return match
    return `<span class="hl-type">${name}</span>`
  })

  return result
}

// 处理章节导航链接点击
function handleClick(e) {
  const link = e.target.closest('.md-nav-link')
  if (link) {
    e.preventDefault()
    const chapterId = link.dataset.chapter
    emit('navigate', chapterId)
  }
}
</script>

<template>
  <article class="markdown-body" v-html="renderedHtml" @click="handleClick"></article>

  <!-- 回到顶部按钮 -->
  <transition name="fade">
    <button v-show="showBackTop" class="back-top" @click="scrollToTop" title="回到顶部">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </transition>
</template>

<style scoped>
/* 回到顶部 */
.back-top {
  position: fixed;
  bottom: 36px;
  right: 36px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid #dce0e6;
  background: #fff;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.2s;
  z-index: 200;
}
.back-top:hover {
  background: v-bind(accentColor);
  color: #fff;
  border-color: v-bind(accentColor);
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Markdown 样式 */
.markdown-body :deep(h1.md-h1) {
  font-size: 26px;
  color: #1a1a2e;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 3px solid v-bind(accentColor);
}

.markdown-body :deep(h2.md-h2) {
  font-size: 20px;
  color: #1a1a2e;
  margin: 32px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.markdown-body :deep(h3) {
  font-size: 17px;
  color: #333;
  margin: 24px 0 12px;
}

.markdown-body :deep(h4) {
  font-size: 15px;
  color: #444;
  margin: 20px 0 10px;
}

.markdown-body :deep(p) {
  font-size: 14.5px;
  line-height: 1.75;
  color: #444;
  margin: 8px 0;
}

/* 代码块 */
.markdown-body :deep(pre.code-block) {
  background: #f8f9fc;
  border: 1px solid #e2e6ed;
  border-radius: 8px;
  padding: 16px 20px;
  margin: 14px 0;
  overflow-x: auto;
  position: relative;
}

.markdown-body :deep(pre.code-block .code-lang) {
  position: absolute;
  top: 6px;
  right: 10px;
  font-size: 11px;
  color: #aab;
  font-family: -apple-system, sans-serif;
  user-select: none;
  pointer-events: none;
}

.markdown-body :deep(pre.code-block code) {
  font-family: 'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.65;
  color: #2e3440;
  white-space: pre;
}

.markdown-body :deep(.hl-keyword) { color: #8250df; font-weight: 500; }
.markdown-body :deep(.hl-string) { color: #0a7e32; }
.markdown-body :deep(.hl-comment) { color: #8b949e; font-style: italic; }
.markdown-body :deep(.hl-number) { color: #0550ae; }
.markdown-body :deep(.hl-type) { color: #953800; }

/* 行内代码 */
.markdown-body :deep(code.inline-code) {
  background: #eff1f5;
  color: #c7254e;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Menlo', monospace;
  font-size: 13px;
  border: 1px solid #e2e6ed;
}

/* 列表 */
.markdown-body :deep(ul.md-list) {
  padding-left: 20px;
  margin: 8px 0;
}

.markdown-body :deep(ul.md-list li) {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
}

.markdown-body :deep(hr.md-hr) {
  border: none;
  border-top: 1px solid #eee;
  margin: 28px 0;
}

/* 引用 */
.markdown-body :deep(blockquote.md-quote) {
  border-left: 4px solid v-bind(accentColor);
  padding: 8px 16px;
  margin: 12px 0;
  background: #f8f9fc;
  color: #555;
  font-size: 14px;
  border-radius: 0 6px 6px 0;
}

/* 表格 */
.markdown-body :deep(table.md-table) {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0;
  font-size: 13.5px;
}

.markdown-body :deep(table.md-table th) {
  background: #f5f7fa;
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  border: 1px solid #e2e6ed;
  color: #333;
}

.markdown-body :deep(table.md-table td) {
  padding: 9px 14px;
  border: 1px solid #e2e6ed;
  color: #555;
}

.markdown-body :deep(table.md-table tbody tr:hover) {
  background: #f8f9fc;
}

/* 链接 */
.markdown-body :deep(a.md-link) {
  color: v-bind(accentColor);
  text-decoration: none;
  border-bottom: 1px dashed v-bind(accentColor);
}
.markdown-body :deep(a.md-link:hover) {
  border-bottom-style: solid;
}

.markdown-body :deep(a.md-nav-link) {
  color: v-bind(accentColor);
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}
.markdown-body :deep(a.md-nav-link:hover) {
  text-decoration: underline;
}

/* checkbox */
.markdown-body :deep(.md-checkbox) {
  font-size: 14px;
  padding: 3px 0;
  color: #666;
}

.markdown-body :deep(.md-checkbox.checked) {
  color: #42b883;
}

.markdown-body :deep(strong) {
  color: #1a1a2e;
}
</style>
