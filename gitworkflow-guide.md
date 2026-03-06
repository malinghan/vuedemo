# Git Worktrees 使用指南

Git worktrees 是一个强大的功能，让你可以同时在多个分支上工作，而不需要频繁切换分支或克隆多个仓库。

## 基础用法

```bash
# 1. 创建新的 worktree
git worktree add ../vuedemo-feature2 feature2

# 2. 列出所有 worktrees
git worktree list

# 3. 删除 worktree
git worktree remove ../vuedemo-feature2

# 4. 清理已删除的 worktree 记录
git worktree prune
```

## 典型使用场景

### 场景 1: 同时开发多个功能

```bash
# 主目录工作在 feature-A
cd /Users/malinghan/project/vuedemo

# 创建 worktree 开发 feature-B
git worktree add ../vuedemo-feature-b feature-b

# 创建 worktree 修复紧急 bug
git worktree add ../vuedemo-hotfix hotfix/critical-bug
```

### 场景 2: 代码审查时不影响当前工作

```bash
# 创建临时 worktree 查看 PR
git worktree add ../vuedemo-review pr-123
cd ../vuedemo-review
# 审查完成后删除
git worktree remove ../vuedemo-review
```

## 配合 Claude Code 的多任务流

### 方式 1: 多终端 + 多 worktrees

```bash
# 终端 1: 主功能开发
cd /Users/malinghan/project/vuedemo
claude  # 启动 Claude Code 处理主任务

# 终端 2: 并行功能开发
git worktree add ../vuedemo-feature2 feature2
cd ../vuedemo-feature2
claude  # 启动另一个 Claude Code 实例

# 终端 3: Bug 修复
git worktree add ../vuedemo-hotfix hotfix-branch
cd ../vuedemo-hotfix
claude  # 第三个 Claude Code 实例
```

### 方式 2: Claude Code 的 Worktree 集成

在 Claude Code 中，你可以明确请求使用 worktree:

```
"在 worktree 中实现用户认证功能"
"创建一个 worktree 来重构数据库层"
```

当你这样请求时，Claude Code 会:
1. 创建隔离的 git worktree
2. 在独立环境中工作
3. 完成后提示你是否保留或删除

### 方式 3: 任务并行化最佳实践

```bash
# 1. 规划任务
# Task A: 实现新功能 (主目录)
# Task B: 重构旧代码 (worktree-1)
# Task C: 编写文档 (worktree-2)

# 2. 设置 worktrees
git worktree add ../vuedemo-refactor refactor-branch
git worktree add ../vuedemo-docs docs-branch

# 3. 在不同终端启动 Claude Code
# 每个实例独立工作，互不干扰
```

## 实用技巧

### 1. 使用命名约定

```bash
git worktree add ../vuedemo-feat-auth feature/auth
git worktree add ../vuedemo-fix-login fix/login-bug
git worktree add ../vuedemo-refactor-api refactor/api
```

### 2. 快速切换脚本

```bash
# 创建别名
alias wt-list='git worktree list'
alias wt-add='git worktree add'
alias wt-rm='git worktree remove'
```

### 3. 清理策略

```bash
# 定期清理不需要的 worktrees
git worktree list
git worktree remove <path>
git worktree prune
```

## 注意事项

1. **同一分支不能在多个 worktrees 中同时检出**
2. **共享 .git 目录** - 所有 worktrees 共享同一个 .git，提交会立即在所有位置可见
3. **磁盘空间** - 每个 worktree 是完整的工作目录副本
4. **路径管理** - 建议将 worktrees 放在父目录，便于管理

## 与 Claude Code 结合的优势

- **隔离环境**: 每个任务在独立的 worktree 中，避免文件冲突
- **并行开发**: 多个 Claude Code 实例可以同时处理不同任务
- **快速切换**: 不需要 stash 或 commit 未完成的工作
- **代码审查**: 可以在不影响当前工作的情况下查看其他分支

## 常见工作流示例

### 示例 1: 功能开发 + 紧急修复

```bash
# 正在主目录开发新功能
cd /Users/malinghan/project/vuedemo

# 突然需要修复生产环境 bug
git worktree add ../vuedemo-hotfix hotfix/prod-bug
cd ../vuedemo-hotfix
# 修复 bug，测试，提交
git add .
git commit -m "fix: 修复生产环境关键 bug"
git push origin hotfix/prod-bug

# 返回主目录继续开发
cd /Users/malinghan/project/vuedemo
```

### 示例 2: 代码重构 + 功能开发

```bash
# 主目录: 开发新功能
cd /Users/malinghan/project/vuedemo

# Worktree 1: 重构旧代码
git worktree add ../vuedemo-refactor refactor/legacy-code

# Worktree 2: 更新文档
git worktree add ../vuedemo-docs docs/update

# 三个任务并行进行，互不干扰
```

### 示例 3: 多版本测试

```bash
# 测试不同版本的兼容性
git worktree add ../vuedemo-v1 release/v1.0
git worktree add ../vuedemo-v2 release/v2.0
git worktree add ../vuedemo-v3 release/v3.0

# 在每个版本中运行测试
cd ../vuedemo-v1 && npm test
cd ../vuedemo-v2 && npm test
cd ../vuedemo-v3 && npm test
```

## 最佳实践

1. **保持 worktree 数量合理** - 通常 2-3 个活跃的 worktree 就足够
2. **及时清理** - 完成任务后立即删除不需要的 worktree
3. **使用描述性名称** - 让 worktree 路径清晰表达其用途
4. **定期同步** - 在各个 worktree 中定期 fetch 和 pull 最新代码
5. **避免在 worktree 间复制文件** - 使用 git 来同步更改

## 故障排除

### 问题: 无法删除 worktree

```bash
# 强制删除
git worktree remove --force <path>
```

### 问题: worktree 列表显示已删除的路径

```bash
# 清理无效记录
git worktree prune
```

### 问题: 分支已在其他 worktree 中检出

```bash
# 查看哪个 worktree 使用了该分支
git worktree list

# 在对应的 worktree 中切换到其他分支，或删除该 worktree
```
