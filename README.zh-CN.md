# cc-compass

> Claude Code 智能向导。输入 `/cc-compass:cc-compass`，获得最多 5 条带原因的命令或操作建议——命令类回数字一键执行，操作类附分步说明。

[English](./README.md) · 简体中文

---

## 解决什么

Claude Code 的命令、skill、hook、worktree、compact、plan mode、agent 一大堆。新手卡的不是某个具体功能，而是**此刻该用哪个**。

cc-compass 不在后台打扰你，只有你显式调用时才工作。调用后由 Claude 自己读情境，从内置场景库挑出最多 5 条建议，每条都给出具体理由：

```
🧭 cc-compass 为你找到 5 个建议：

[1] 命令：/compact
    💡 原因：你已经聊了 ~90 轮，压缩可释放上下文。
    👉 回复 1 立即执行

[2] 命令：EnterWorktree
    💡 原因：你提到要重构整个 auth 模块，隔离试验更安全。
    👉 回复 2 立即执行

[3] 命令：/commit
    💡 原因：积累了不少改动,下一步要提交。
    👉 回复 3 立即执行

[4] 操作：用 Explore subagent 做广度搜索
    💡 原因：要在 auth/ + middleware/ 多目录找 verify_token,子 agent 节省主上下文。
    📋 步骤：
       1. 跟 Claude 说："用 Explore agent 找 verify_token"
       2. Claude 调 Agent 工具并指定 subagent_type=Explore
       3. 精炼结果落回主对话,不污染上下文

[5] 命令：/security-review
    💡 原因：动到了认证逻辑,提交前过一遍安全检查。
    👉 回复 5 立即执行

回复数字（如 1 或 1,3）执行命令类建议；操作类按步骤手动操作；回复 skip 跳过。
```

---

## 工作原理

cc-compass 就是**一个 slash command**——没有 Node 代码、没有构建步骤、不需要 API key、零依赖。整个插件就是 `commands/cc-compass.md`：一段告诉 Claude 如何读情境、如何从内置场景库挑建议的 prompt。

由 Claude 自己做匹配,建议会贴合实际对话内容,而不是死板的正则；同时也不会产生额外 LLM 调用——它就跑在你当前会话里。

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
/cc-compass:cc-compass
```

可以带额外上下文作为参数:

```
/cc-compass:cc-compass 我刚改完 auth/,想准备提交
```

回复:
- `1` — 执行第 1 条建议
- `1,3` — 顺序执行 1 和 3
- `skip` — 跳过

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
