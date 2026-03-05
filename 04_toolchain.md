# 04 · 工具链 — 现代前端的基础设施

> 类比：工具链是前端开发的**工厂流水线**。
> 原材料（源代码）进去，经过各种机器（工具）加工，出来可以直接上线的产品。

**学习目标**
- [ ] 理解 npm 包管理
- [ ] 会用 Vite 创建和运行项目
- [ ] 掌握 Git 基本工作流
- [ ] 了解 ESLint 代码规范

**预计学习时长**：2 天

---

## 1. npm — 包管理器

### 类比：应用商店

npm（Node Package Manager）就是前端的**应用商店**：
别人写好的功能（包/库）发布到商店，你一行命令就能安装使用。

```
npm 生态系统：

开发者A 写了 lodash（工具函数库）
    │  npm publish
    ▼
  npm 仓库（npmjs.com）
    │  npm install lodash
    ▼
你的项目 node_modules/lodash/
    │  import _ from 'lodash'
    ▼
直接使用
```

**package.json — 项目的身份证：**

```json
{
  "name": "vuedemo",
  "version": "1.0.0",
  "scripts": {
    "dev":   "vite",          // npm run dev   → 启动开发服务器
    "build": "vite build",    // npm run build → 打包生产版本
    "preview": "vite preview" // npm run preview → 预览打包结果
  },
  "dependencies": {
    "vue": "^3.4.0"           // 生产依赖（上线也需要）
  },
  "devDependencies": {
    "vite": "^5.0.0"          // 开发依赖（只在开发时用）
  }
}
```

**常用命令：**

```bash
# 安装依赖（读取 package.json，下载所有包）
npm install

# 安装某个包（生产依赖）
npm install axios
npm install vue-router@4

# 安装开发依赖（只在开发时用）
npm install -D eslint
npm install -D @vitejs/plugin-vue

# 卸载
npm uninstall axios

# 查看已安装的包
npm list --depth=0

# 更新包
npm update

# 运行脚本
npm run dev
npm run build
```

**版本号规则（语义化版本）：**

```
^3.4.0  →  主版本.次版本.补丁版本

^3.4.0  允许更新到 3.x.x（不跨主版本）
~3.4.0  允许更新到 3.4.x（只更新补丁）
3.4.0   精确版本，不自动更新

主版本（3）：不兼容的 API 变更
次版本（4）：新增功能，向后兼容
补丁（0）：  bug 修复
```

---

## 2. Vite — 构建工具

### 类比：现代化工厂 vs 老式作坊

Webpack（老式）：所有原材料先全部打包，再启动 → 慢
Vite（现代）：按需加载，改了哪个文件只更新那个 → 极快

```
开发模式（npm run dev）：
源代码 → Vite 开发服务器 → 浏览器
         （按需编译，极速热更新）

生产模式（npm run build）：
源代码 → Rollup 打包 → dist/ 目录
         （压缩、Tree-shaking、代码分割）
```

**项目结构：**

```
vuedemo/
├── public/              ← 静态资源（直接复制，不处理）
│   └── favicon.ico
├── src/                 ← 源代码
│   ├── assets/          ← 图片、字体等（会被处理）
│   ├── components/      ← Vue 组件
│   ├── App.vue          ← 根组件
│   └── main.js          ← 入口文件
├── index.html           ← HTML 模板（Vite 的入口）
├── vite.config.js       ← Vite 配置
└── package.json
```

**vite.config.js 常用配置：**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  // 路径别名（@ 代替 src/）
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,   // 自动打开浏览器
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

---

## 3. Git — 版本控制

### 类比：游戏存档系统

Git 就是代码的**存档系统**：
- 随时存档（commit）
- 随时回到任意存档点（checkout）
- 多人同时玩不冲突（branch + merge）

**核心概念：**

```
工作区（Working Directory）
    │  git add
    ▼
暂存区（Staging Area / Index）
    │  git commit
    ▼
本地仓库（Local Repository）
    │  git push
    ▼
远程仓库（Remote Repository，如 GitHub）
```

**日常工作流：**

```
1. 开始新功能
   git checkout -b feature/login    ← 创建并切换到新分支

2. 写代码...

3. 查看状态
   git status                       ← 看哪些文件改了
   git diff                         ← 看具体改了什么

4. 提交
   git add src/components/Login.vue ← 添加到暂存区
   git add .                        ← 添加所有改动
   git commit -m "feat: 添加登录组件" ← 提交

5. 推送到远程
   git push origin feature/login

6. 合并到主分支（通常通过 Pull Request）
   git checkout main
   git merge feature/login
```

**常用命令速查：**

```bash
# 初始化
git init                    # 初始化仓库
git clone <url>             # 克隆远程仓库

# 查看状态
git status                  # 工作区状态
git log --oneline           # 提交历史（简洁）
git diff                    # 未暂存的改动
git diff --staged           # 已暂存的改动

# 提交
git add <file>              # 添加指定文件
git add .                   # 添加所有改动
git commit -m "message"     # 提交
git commit --amend          # 修改最后一次提交

# 分支
git branch                  # 查看所有分支
git branch feature/xxx      # 创建分支
git checkout feature/xxx    # 切换分支
git checkout -b feature/xxx # 创建并切换
git merge feature/xxx       # 合并分支
git branch -d feature/xxx   # 删除分支

# 远程
git remote -v               # 查看远程地址
git push origin main        # 推送
git pull origin main        # 拉取并合并
git fetch                   # 只拉取不合并

# 撤销
git restore <file>          # 撤销工作区改动
git restore --staged <file> # 从暂存区移除
git revert <commit>         # 撤销某次提交（安全）
```

**提交信息规范（Conventional Commits）：**

```
类型(范围): 描述

feat:     新功能
fix:      bug 修复
docs:     文档更新
style:    代码格式（不影响逻辑）
refactor: 重构
test:     测试相关
chore:    构建/工具相关

例：
feat(auth): 添加用户登录功能
fix(cart): 修复购物车数量计算错误
docs: 更新 README 安装说明
```

**.gitignore — 告诉 Git 忽略哪些文件：**

```
node_modules/    ← 依赖包（体积大，不提交）
dist/            ← 打包产物
.env             ← 环境变量（含密钥，不提交！）
.DS_Store        ← macOS 系统文件
*.log            ← 日志文件
```

---

## 4. ESLint — 代码规范

### 类比：语文老师

ESLint 是代码的**语文老师**：帮你检查语法错误、不规范写法，强制团队统一风格。

```bash
# 安装
npm install -D eslint @eslint/js

# 初始化配置
npx eslint --init
```

**eslint.config.js（Vue 项目推荐配置）：**

```javascript
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      'no-console': 'warn',          // console.log 警告
      'no-unused-vars': 'error',     // 未使用变量报错
      'vue/multi-word-component-names': 'off'  // 关闭组件名必须多词的规则
    }
  }
]
```

---

## 5. 综合练习

### 练习 1：初始化一个 Vue 项目（必做）

```bash
# 创建项目
npm create vite@latest my-app -- --template vue
cd my-app
npm install
npm run dev
```

### 练习 2：Git 工作流练习（必做）

1. 初始化 Git 仓库
2. 创建 `feature/hello` 分支
3. 修改 `App.vue`，提交
4. 合并回 `main`

### 练习 3：发布到 GitHub Pages（进阶）

```bash
npm run build
# 将 dist/ 目录推送到 gh-pages 分支
```

---

## 自测题

- [ ] `dependencies` 和 `devDependencies` 的区别？
- [ ] `npm install` 和 `npm install -D` 的区别？
- [ ] Git 的工作区、暂存区、仓库分别是什么？
- [ ] 为什么 `node_modules` 不提交到 Git？
- [ ] `git merge` 和 `git rebase` 的区别？

---

## 学习资源

| 资源 | 链接 | 说明 |
|------|------|------|
| npm 官网 | https://www.npmjs.com/ | 搜索包 |
| Vite 中文文档 | https://cn.vitejs.dev/ | 官方文档 |
| Git 官方教程 | https://git-scm.com/book/zh/v2 | Pro Git 中文版 |
| Learn Git Branching | https://learngitbranching.js.org/?locale=zh_CN | 可视化学 Git |
| GitHub | https://github.com/ | 代码托管 |

---

> 完成后把 `INDEX.md` 里 `04_toolchain.md` 的 `☐` 改为 `✅`
>
> 下一步 → `05_vue_basics.md`
