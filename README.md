# cc-compass

> Smart on-demand guide for Claude Code. Type `/cc-compass:cc-compass` to get up to 5 contextual suggestions with reasons — commands run with a single keystroke, actions come with step-by-step instructions.

English · [简体中文](./README.zh-CN.md)

---

## What it solves

Claude Code ships with many commands, skills, hooks, worktrees, compaction, plan mode, agents… The hard part for newcomers isn't *using* any one of them — it's **knowing which one to reach for right now**.

cc-compass does not nag you in the background. It only runs **when you call it**. When invoked, Claude itself analyses the current situation and returns up to 5 suggestions, each with a concrete reason:

```
🧭 cc-compass 为你找到 5 个建议：

[1] 命令：/compact
    💡 原因：你已经聊了 ~90 轮，压缩可释放上下文。
    👉 回复 1 立即执行

[2] 命令：EnterWorktree
    💡 原因：你提到要重构整个 auth 模块，隔离试验更安全。
    👉 回复 2 立即执行

[3] 命令：/commit
    💡 原因：积累了不少改动，下一步要提交。
    👉 回复 3 立即执行

[4] 操作：用 Explore subagent 做广度搜索
    💡 原因：要在 auth/ + middleware/ 多目录找 verify_token，子 agent 节省主上下文。
    📋 步骤：
       1. 跟 Claude 说："用 Explore agent 找 verify_token"
       2. Claude 调 Agent 工具并指定 subagent_type=Explore
       3. 精炼结果落回主对话，不污染上下文

[5] 命令：/security-review
    💡 原因：动到了认证逻辑，提交前过一遍安全检查。
    👉 回复 5 立即执行

回复数字（如 1 或 1,3）执行命令类建议；操作类按步骤手动操作；回复 skip 跳过。
```

---

## How it works

cc-compass is **a single slash command** — no Node code, no build step, no API key, no dependencies. The entire plugin is `commands/cc-compass.md`: a prompt that tells Claude how to read the situation and pick suggestions from a built-in scenario catalog.

Because Claude itself does the matching, the suggestions adapt to your actual conversation rather than a fixed regex list, and you don't pay any extra LLM cost beyond your normal session.

---

## Install

### Marketplace

Add the marketplace and install:

```bash
# In Claude Code:
/plugin marketplace add s554097550/cc-compass
/plugin install cc-compass@cc-compass
```

Or add to `~/.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "cc-compass@cc-compass": true
  }
}
```

Then restart Claude Code.

### Local clone (dev)

```bash
git clone https://github.com/s554097550/cc-compass.git ~/code/cc-compass
# Then point a marketplace entry at it, or copy into the plugin cache.
```

---

## Usage

In Claude Code:

```
/cc-compass:cc-compass
```

You can pass extra context as an argument:

```
/cc-compass:cc-compass 我刚改完 auth/，想准备提交
```

Reply:
- `1` — run suggestion 1
- `1,3` — run 1 then 3
- `skip` — dismiss

---

## Extending

Open `commands/cc-compass.md`, find the `## 场景库` section, and append a YAML entry. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full schema.

PRs adding scenarios are welcome.

---

## Privacy

cc-compass runs **only on explicit invocation**. It makes no outbound network requests. The plugin is a markdown prompt; Claude Code reads it locally and feeds it to the model handling your current session.

---

## License

MIT
