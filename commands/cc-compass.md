---
description: Claude Code 智能向导。分析当前对话情境，给出 N 条带原因的命令或操作建议。
argument-hint: "[skip|extra context]"
---

运行下面的 Bash 命令获取本次建议：

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/compass.mjs
```

环境变量（如能从当前上下文获取，请设置；获取不到可跳过）：
- `CC_COMPASS_CWD`：当前工作目录
- `CC_COMPASS_RECENT`：最近几轮用户/助手发言摘要（用 `\n---\n` 分隔）
- `CC_COMPASS_PROMPT`：用户本轮的求助语（如果有）

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
