---
name: cc-compass
description: 智能向导。当用户输入 /cc-compass、/compass、/向导，或问"我现在该做什么 / 给点建议 / 帮我看看接下来怎么办 / what should I do next"等迷茫求助类问题时触发。分析当前会话情境，给出最多 N 条带原因解释的命令或操作建议；用户回数字即代为执行命令类建议，操作类按步骤引导。
---

# cc-compass — Claude Code 智能向导

## 触发条件

当用户：
- 显式输入 `/cc-compass`、`/compass`、`/向导`，或在配置 `aliases` 里出现的任何别名
- 用自然语言求助："我现在该做什么"、"给点建议"、"接下来怎么办"、"帮我看看怎么处理"、"what should I do next"、"any suggestions"

## 执行步骤

1. 运行 Bash：

   ```
   node ${CLAUDE_PLUGIN_ROOT}/bin/compass.mjs
   ```

   传入环境变量（如能从当前上下文得到）：
   - `CC_COMPASS_CWD`：当前工作目录
   - `CC_COMPASS_RECENT`：最近 3 轮用户/助手发言摘要（用 `\n---\n` 分隔），若无可省略
   - `CC_COMPASS_LOCALE`：用户语言（zh-CN / en），可省略由程序自检

2. **完整展示 stdout** 给用户，但**隐藏** `<cc-compass-suggestions>...</cc-compass-suggestions>` 块——这是机器可读的建议清单，你自己要记住每个编号对应的命令或操作，用户看不到。

3. 等待用户回复。

## 用户回复处理

| 用户输入 | 你的动作 |
|----------|---------|
| 单个数字 `3` | 执行编号 3 的建议 |
| 多个数字 `1,3` 或 `1 3` | 顺序执行 |
| `skip` 或 `0` 或 `算了` | 不执行任何建议 |
| 自由文本 | 当作新需求处理 |

执行规则：
- **cmd 类**（行格式 `N|cmd|<command>|<short_reason>`）：
  - 若 command 形如 `/xxx`，调用对应 skill
  - 若是工具名（如 `EnterWorktree`、`EnterPlanMode`），直接调用该工具
- **action 类**（`N|action|<title>|<note>`）：按 stdout 中已经给出的"步骤"引导用户手动操作，不要替用户做不可逆操作

## 注意

- 不要直接把建议清单复述给用户——stdout 里已经渲染好了，你只需要展示原文
- 不要把 `<cc-compass-suggestions>` 块的内容暴露给用户
- 若 compass.mjs 退出码非 0，把 stderr 告诉用户并建议检查 `~/.claude/cc-compass.config.json`
