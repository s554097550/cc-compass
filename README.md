# cc-compass

> Smart on-demand guide for Claude Code. Type `/cc-compass:go` to get up to 4 contextual suggestions in a native arrow-key picker — pick one and Claude runs it.

English · [简体中文](./README.zh-CN.md)

---

## What it solves

Claude Code ships with many commands, skills, hooks, worktrees, compaction, plan mode, agents… The hard part for newcomers isn't *using* any one of them — it's **knowing which one to reach for right now**.

cc-compass does not nag you in the background. It only runs **when you call it**. When invoked, Claude reads the current situation and pops up a native picker (arrow keys + Enter) with up to 4 suggestions, each labeled with a concrete reason:

```
? 🧭 cc-compass 找到这几条建议，选哪个?
❯ /compact — 释放上下文
    会话已经较长，压缩可释放上下文容量
  EnterWorktree — 隔离重构
    你提到要重构 auth 模块，隔离试验更安全
  /commit — 准备提交
    积累了改动，下一步要 push
  跳过
    不执行任何建议
```

Pick one, Claude runs it. No typing numbers, no copy-paste, no extra permission prompts.

---

## How it works

cc-compass is **a single slash command** — no Node code, no build step, no API key, no dependencies. The entire plugin is `commands/cc-compass.md`: a prompt that tells Claude how to read the situation, pick suggestions from a built-in scenario catalog, and present them through the `AskUserQuestion` tool.

Because Claude itself does the matching, the suggestions adapt to your actual conversation rather than a fixed regex list, and you don't pay any extra LLM cost beyond your normal session.

---

## Install

### Marketplace

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
/cc-compass:go
```

You can pass extra context as an argument:

```
/cc-compass:go 我刚改完 auth/，想准备提交
```

Then use arrow keys + Enter in the picker. Choose **跳过** (or "Other → skip") to dismiss.

### Make it even shorter (optional)

If `/cc-compass:go` is still too long, define a personal alias. Create `~/.claude/commands/c.md`:

```markdown
---
description: Shortcut for /cc-compass:go
argument-hint: [extra context]
---

/cc-compass:go $ARGUMENTS
```

Now `/c` does the same thing. This is your personal config — not bundled with the plugin, so it won't conflict if the plugin updates.

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
