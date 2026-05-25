---
description: Claude Code 智能向导。分析当前对话情境，给出 N 条带原因的命令或操作建议。
argument-hint: [skip|extra context]
---

运行下面的 Bash 命令获取本次建议。**你必须按下面要求传入环境变量**——不要直接裸跑 `node bin/compass.mjs`，否则规则匹配不到关键词，会返回空建议。

```bash
CC_COMPASS_CWD="$(pwd)" \
CC_COMPASS_PROMPT="<把用户本轮的求助语原文填这里>" \
CC_COMPASS_RECENT="<把最近 2-3 轮的用户/助手发言精简摘要填这里，每轮之间用 \n---\n 分隔>" \
node ${CLAUDE_PLUGIN_ROOT}/bin/compass.mjs
```

- `CC_COMPASS_PROMPT`：用户这次 `/cc-compass:cc-compass` 之前（或同一轮）说的话。如果用户只输入了 `/cc-compass:cc-compass` 没说别的，可填最近一轮用户消息。
- `CC_COMPASS_RECENT`：当前对话最近 2-3 轮的关键摘要（不必全文）。例：`user: 想把 auth 模块重构一下\n---\nassistant: 我看了下 auth/ 有 5 个文件\n---\nuser: 然后准备提交`
- `CC_COMPASS_CWD`：当前工作目录。

注意 shell 转义：把双引号 `"` 写成 `\"`，换行用真实的 `\n`（在 shell 里两个字符）。

## 展示规则

把 stdout **完整**显示给用户，但**隐藏** `<cc-compass-suggestions>...</cc-compass-suggestions>` 块（它是机器可读清单，你自己要记住每个编号对应的命令或操作）。

## 用户回复处理

| 用户输入 | 你的动作 |
|----------|---------|
| 单个数字 `3` | 执行编号 3 的建议 |
| 多个数字 `1,3` 或 `1 3` | 顺序执行 |
| `skip` / `0` / `算了` | 不执行任何建议 |
| 自由文本 | 当作新需求处理 |

- **cmd 类**（机器块里 `N|cmd|<command>|...`）：
  - `command` 形如 `/xxx` → 调用对应 skill / 命令
  - `command` 是工具名（如 `EnterWorktree`、`EnterPlanMode`）→ 直接调该工具
- **action 类**（`N|action|<title>|...`）：按 stdout 中已给的步骤引导用户手动操作，不要替用户做不可逆操作

## 注意

- 不要把建议清单复述给用户，stdout 已经渲染好
- 不要把 `<cc-compass-suggestions>` 块的内容暴露
- 非零退出码：把 stderr 告诉用户，并建议检查 `~/.claude/cc-compass.config.json`
