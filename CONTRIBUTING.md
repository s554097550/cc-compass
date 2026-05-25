# Contributing to cc-compass

Thanks for considering a contribution! cc-compass is built to be easy to extend — most useful contributions are **new scenarios** or **new rules**, both of which are 5-minute changes.

## Repo layout

```
.claude-plugin/plugin.json   # plugin metadata
skills/cc-compass/SKILL.md   # entry point — Claude reads this
bin/compass.mjs              # main runner (Node.js, ESM)
lib/
  config.mjs                 # config loading & merge
  context.mjs                # situational context
  rules/index.mjs            # all rules in one file (intentional, for skimmability)
  advisor.mjs                # Anthropic Messages API client
  formatter.mjs              # output renderer
  i18n.mjs                   # zh-CN / en strings
scenarios.yaml               # candidate scenarios catalog (fed to advisor)
```

## Adding a scenario (no code needed)

Just append to `scenarios.yaml`. Required: `id`, `type` (`cmd` or `action`), `trigger`, `reason`. For `cmd` add `command`; for `action` add `title` and optionally `steps`.

```yaml
- id: my-thing
  type: cmd
  command: /my-skill
  trigger: 用户提到 X / Y / Z
  reason: 一句话解释为什么这时候推荐
```

The advisor uses `trigger` to decide when to suggest this, and `reason` as a fallback explanation. Keep both concrete — vague entries get suggested at random.

## Adding a rule (catches a scenario without an API call)

Add an entry to the `RULES` array in `lib/rules/index.mjs`:

```js
{
  id: 'my-thing',
  priority: 60,
  match: ctx => {
    if (has(recent(ctx), '关键词1', '关键词2', 'keyword')) {
      return {
        type: 'cmd',
        command: '/my-skill',
        reason: '具体到你提到 X 的原因',
      };
    }
    return null;
  },
},
```

Priorities are relative; 100 = high, 10 = low. Same `id` as the scenario keeps things deduplicated when the advisor also suggests it.

## Testing locally

```bash
# Symlink into your Claude Code plugins directory
ln -s /path/to/cc-compass ~/.claude/plugins/cc-compass

# Restart Claude Code, then in a session:
/cc-compass
```

Or run the entry directly to test rules/advisor without the full Claude Code loop:

```bash
CC_COMPASS_ADVISOR_ENABLED=false \
CC_COMPASS_PROMPT="我想重构 auth 模块" \
CC_COMPASS_RECENT="user: ...\n---\nassistant: ..." \
node bin/compass.mjs
```

To test the advisor path:

```bash
ANTHROPIC_AUTH_TOKEN=sk-... \
CC_COMPASS_MODEL=claude-haiku-4-5-20251001 \
CC_COMPASS_PROMPT="..." \
node bin/compass.mjs
```

## PR guidelines

- One scenario or one rule per PR is ideal — easier to review and discuss
- For new rules, include a 1-line example prompt that should trigger it
- Don't add dependencies — the plugin is intentionally zero-dep
- Keep `reason` strings short (<= 80 chars) and concrete

## Code style

- ESM only (`.mjs`)
- No build step
- 2-space indent, single quotes, semicolons
- Bilingual strings live in `lib/i18n.mjs` — please add both `zh-CN` and `en`

## Filing issues

Most useful: tell us **what you typed**, **what you got**, and **what you expected**. Bonus points for a reproducible prompt.
