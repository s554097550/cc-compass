# cc-compass

> Claude Code 智能向导。一句 `/cc-compass`，告诉你此刻最值得做的几件事——附带原因，命令可一键执行，操作有分步说明。

[English](./README.md) · 简体中文

---

## 它解决什么问题

Claude Code 有大量命令、skill、hook、worktree、compact 等概念。新手最大的痛点不是"不会用"，而是"**不知道自己什么时候该用什么**"。

cc-compass 不在后台打扰你，**只在你主动召唤时**分析当前情境，给最多 N 条建议：

```
🧭 cc-compass 为你找到 5 个建议：

[1] 命令: /compact
    💡 原因: 当前会话已较长（约 92 轮 / 48KB），压缩可释放上下文容量
    👉 回复 1 立即执行

[2] 命令: EnterWorktree
    💡 原因: 你提到要"重构整个 auth 模块"，进 worktree 可隔离试验
    👉 回复 2 立即执行

[3] 命令: /commit
    💡 原因: 改动较多且你提到 push，先生成规范 commit message
    👉 回复 3 立即执行

[4] 操作: 用 Explore subagent 找 token 校验逻辑
    💡 原因: 跨 auth/ middleware/ 两个目录，subagent 节省主上下文
    📋 步骤:
       1. 告诉 Claude："用 Explore agent 找 verify_token"
       2. Claude 会用 Agent 工具并指定 subagent_type=Explore
       3. agent 返回精炼结果，不污染主对话

[5] 命令: /security-review
    💡 原因: 涉及 auth 安全敏感改动，提交前过一遍更稳
    👉 回复 5 立即执行

回复数字（如 1 或 1,3）执行命令类建议；操作类按步骤手动操作；回复 skip 跳过。
```

---

## 安装

### 方式一：marketplace（推荐）

把下面这条加到你的 `~/.claude/settings.json`：

```json
{
  "enabledPlugins": {
    "cc-compass@s554097550": true
  }
}
```

然后从 marketplace 安装（具体命令视 Claude Code 版本而定）。

### 方式二：本地软链（开发/试用）

```bash
git clone https://github.com/s554097550/cc-compass.git ~/code/cc-compass
ln -s ~/code/cc-compass ~/.claude/plugins/cc-compass
# 重启 Claude Code
```

---

## 使用

在 Claude Code 里直接输入：

```
/cc-compass
```

或问自然语言：

```
我现在该做什么？
给点建议
帮我看看接下来怎么办
```

收到建议后：
- 回 `1` 执行第 1 条
- 回 `1,3` 顺序执行 1、3
- 回 `skip` 跳过

---

## 配置

放在 `~/.claude/cc-compass.config.json`（用户级）或 `<project>/.claude/cc-compass.config.json`（项目级）：

```json
{
  "aliases": ["cc-compass", "compass", "向导"],
  "fill_to_n": 5,
  "locale": "auto",
  "advisor": {
    "enabled": true,
    "model": null,
    "base_url": null,
    "auth_token": null,
    "always_call": false,
    "max_transcript_tokens": 1500,
    "timeout_ms": 8000
  },
  "rules_disabled": []
}
```

| 字段 | 默认 | 说明 |
|------|------|------|
| `aliases` | `["cc-compass","compass","向导"]` | 触发别名 |
| `fill_to_n` | `5` | 最多展示几条建议 |
| `locale` | `auto` | 文案语言：`zh-CN` / `en` / `auto`（按系统 LANG） |
| `advisor.enabled` | `true` | 是否在规则不足时调判官模型补足 |
| `advisor.model` | `null`（启用判官时**必填**） | 设成你端点支持的模型 id，如官方 API 用 `claude-haiku-4-5-20251001` |
| `advisor.base_url` | `null` → 继承 `ANTHROPIC_BASE_URL` | API 端点，可填第三方兼容端点 |
| `advisor.auth_token` | `null` → 继承 `ANTHROPIC_AUTH_TOKEN` | API key |
| `advisor.always_call` | `false` | 即使规则已凑够也调判官（更智能但更费 token） |
| `advisor.timeout_ms` | `8000` | 判官超时 |
| `rules_disabled` | `[]` | 不想要的规则 id 列表 |

环境变量也可覆盖：`CC_COMPASS_FILL_TO_N`、`CC_COMPASS_MODEL`、`CC_COMPASS_ADVISOR_ENABLED` 等。

### 三种模式

| 模式 | 配置 | 行为 |
|------|------|------|
| **纯规则**（免费、零外发） | `advisor.enabled: false` | 只跑本地规则，不调任何 API |
| **混合**（默认） | `advisor.enabled: true, always_call: false` | 规则先跑，不足 N 条时让 Haiku 补 |
| **全模型**（最智能） | `advisor.enabled: true, always_call: true` | 每次都调判官，规则只用于兜底 |

---

## 隐私

cc-compass 只在你主动 `/cc-compass` 时运行，**没有任何后台 hook**。

**纯规则模式**下，**不会**发起任何外部请求。

**混合 / 全模型模式**下，发给判官的内容包含：
- 最近 3 轮对话摘要（按 `max_transcript_tokens` 截断）
- 当前 cwd 的目录名（不含完整路径）
- 是否 git 仓库、是否有 CLAUDE.md
- 场景库（`scenarios.yaml`）

**永不发送**：
- 环境变量、API key 之外的任何 secret
- 文件内容（除非你在对话里贴了出来）
- 完整路径、用户名、机器名

---

## 排查

| 现象 | 可能原因 | 处理 |
|------|---------|------|
| `[cc-compass] advisor needs ANTHROPIC_AUTH_TOKEN` | 判官没拿到 API key | 设置 `ANTHROPIC_AUTH_TOKEN`，或在配置里填 `advisor.auth_token`，或 `advisor.enabled: false` 切纯规则 |
| `advisor HTTP 400: model not found` | 默认模型 id 在你的端点上未注册 | 在配置里指定你端点支持的 `advisor.model` |
| `advisor response was not valid JSON: ...` | 判官返回了散文不是 JSON | 换更强的模型，或再跑一次（多半偶发） |
| `/cc-compass` 后只显示"暂无建议" | 规则未命中且判官被禁/未授权 | 多给点上下文，或开判官，或提个 issue 说明本应命中的场景 |
| 出了建议但回 `1` 主 Claude 不执行 | skill 输出被隐藏或 assistant 没保留机器块 | 再跑一次 `/cc-compass`，确认 assistant 按 SKILL.md 执行 |

---

## 扩展场景

新增建议只需改两处：

1. `lib/rules/index.mjs` 加一条规则（可选，用于规则层兜底）
2. `scenarios.yaml` 加一条场景描述（必需，喂判官）

欢迎 PR 添加你常用的场景！

---

## License

MIT
