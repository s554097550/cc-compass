# Contributing to cc-compass

Thanks for considering a contribution! cc-compass is intentionally tiny — a single markdown file (`commands/cc-compass.md`) is the whole product. The most useful contributions are **new scenarios**.

## Repo layout

```
.claude-plugin/
  plugin.json              # plugin metadata
  marketplace.json         # self-hosted marketplace entry
commands/
  cc-compass.md            # the entire plugin — frontmatter + prompt
README.md / README.zh-CN.md
LICENSE
```

There is **no Node code, no build step, no dependencies**. The slash command body is a prompt that Claude Code reads and follows directly. That's the whole architecture.

## Adding a scenario

Edit the `## 场景库` section of `commands/cc-compass.md` and append a YAML entry:

```yaml
- id: my-thing
  type: cmd                # or "action"
  command: /my-skill       # required for cmd type
  # title: 我的操作       # required for action type
  trigger: 用户提到 X / Y / Z
  reason: 一句话解释为什么这时候推荐
  # steps:                 # optional, action type only
  #   - 步骤1
  #   - 步骤2
```

Field reference:

| field | required | meaning |
|-------|----------|---------|
| `id` | yes | Stable identifier; used in the machine-readable block |
| `type` | yes | `cmd` (one-keystroke) or `action` (manual steps) |
| `command` | cmd only | A `/slash-command` or a tool name (e.g. `EnterWorktree`, `EnterPlanMode`) |
| `title` | action only | Short title for the action |
| `trigger` | yes | When this scenario applies (natural language; Claude reads this) |
| `reason` | yes | Default reason template (Claude rewrites it to fit the actual session) |
| `steps` | action only | Step-by-step manual instructions |

Keep `trigger` and `reason` concrete. Vague entries get suggested at random.

## Testing locally

1. Clone or symlink the repo into your Claude Code plugin cache, or install via the marketplace.
2. Restart Claude Code.
3. In a session, type `/cc-compass:cc-compass` and check that suggestions match the situation.

Tip: add a deliberately mismatched prompt and verify the scenario you added doesn't get force-suggested out of context.

## PR guidelines

- One scenario per PR is ideal — easier to review.
- Keep `reason` strings short (<= 80 chars) and concrete.
- Don't add dependencies. The plugin is intentionally zero-code.
- If you change the workflow / output format / user-reply handling, explain why in the PR description.

## Filing issues

Most useful: tell us **what you typed**, **what suggestions you got**, and **what you expected**. Reproducible prompts get fixed faster.
