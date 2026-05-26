# cc-compass

> Claude Code 智能向导。输入 `/cc-compass:go`，弹出方向键可选的菜单，最多 4 条贴合当前情境的建议——选中即执行。

[English](./README.md) · 简体中文

---

## 解决什么

Claude Code 的命令、skill、hook、worktree、compact、plan mode、agent 一大堆。新手卡的不是某个具体功能，而是**此刻该用哪个**。

cc-compass 不在后台打扰你，只有你显式调用时才工作。调用后由 Claude 自己读情境，**用原生菜单弹出最多 4 条建议**（方向键 + 回车选），每条带具体理由：

```
? 🧭 cc-compass 找到这几条建议，选哪个?
❯ /compact — 释放上下文
    会话已经较长,压缩可释放上下文容量
  EnterWorktree — 隔离重构
    你提到要重构 auth 模块,隔离试验更安全
  /commit — 准备提交
    积累了改动,下一步要 push
  跳过
    不执行任何建议
```

选中一条,Claude 直接执行。不用打数字、不用复制粘贴、不会弹额外的权限确认。

---

## 工作原理

cc-compass 就是**一个 slash command**——没有 Node 代码、没有构建步骤、不需要 API key、零依赖。整个插件就是 `commands/cc-compass.md`:一段告诉 Claude 如何读情境、如何挑建议、并用 `AskUserQuestion` 工具弹菜单的 prompt。

由 Claude 自己做匹配,建议会贴合实际对话内容,而不是死板的正则;同时也不会产生额外 LLM 调用——它就跑在你当前会话里。

---

## 安装

### Marketplace

```bash
# 在 Claude Code 里:
/plugin marketplace add s554097550/cc-compass
/plugin install cc-compass@cc-compass
```

或者直接编辑 `~/.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "cc-compass@cc-compass": true
  }
}
```

之后重启 Claude Code。

### 本地克隆（开发）

```bash
git clone https://github.com/s554097550/cc-compass.git ~/code/cc-compass
# 用 marketplace 条目指过去,或复制到 plugin cache。
```

---

## 用法

在 Claude Code 里:

```
/cc-compass:go
```

可以带额外上下文作为参数:

```
/cc-compass:go 我刚改完 auth/,想准备提交
```

之后用方向键 + 回车在菜单里选。选 **跳过**（或 "Other → skip"）取消。

### 想再短一点？（可选）

如果觉得 `/cc-compass:go` 还是有点长,可以给自己加个 alias。新建 `~/.claude/commands/c.md`:

```markdown
---
description: cc-compass 快捷别名
argument-hint: [额外上下文]
---

/cc-compass:go $ARGUMENTS
```

之后输 `/c` 就等价于 `/cc-compass:go`。这是你自己的本地配置,不会和插件冲突,插件更新也不会动它。

---

## 扩展

打开 `commands/cc-compass.md`,找到 `## 场景库`,按格式追加 YAML 条目即可。完整 schema 见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

欢迎提 PR 添加新场景。

---

## 隐私

cc-compass **仅在你主动调用时**才运行,不发任何外部请求。插件本身就是一段 markdown prompt,Claude Code 在本地读取后喂给当前会话使用的模型。

---

## License

MIT
