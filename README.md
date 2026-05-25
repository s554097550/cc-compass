# cc-compass

> Smart on-demand guide for Claude Code. Type `/cc-compass` to get up to N contextual suggestions with reasons — commands run with a single keystroke, actions come with step-by-step instructions.

English · [简体中文](./README.zh-CN.md)

---

## What it solves

Claude Code ships with many commands, skills, hooks, worktrees, compaction, plan mode, agents… The hard part for newcomers isn't *using* any one of them — it's **knowing which one to reach for right now**.

cc-compass does not nag you in the background. It only runs **when you call it**, then analyses the current situation and returns up to N suggestions, each with a concrete reason:

```
🧭 cc-compass found 5 suggestions for you:

[1] Command: /compact
    💡 Why: Session is long (~92 turns / 48KB). Compacting frees context.
    👉 Reply 1 to run

[2] Command: EnterWorktree
    💡 Why: You mentioned refactoring the whole auth module — isolate the experiment.
    👉 Reply 2 to run

[3] Command: /commit
    💡 Why: Changes are piling up and you mentioned push.
    👉 Reply 3 to run

[4] Action: Use Explore subagent to find token validation
    💡 Why: It spans auth/ and middleware/. A subagent saves main context.
    📋 Steps:
       1. Say "use Explore agent to find verify_token"
       2. Claude will call Agent with subagent_type=Explore
       3. Distilled result lands without polluting your conversation

[5] Command: /security-review
    💡 Why: Auth-sensitive change — run a security pass before committing.
    👉 Reply 5 to run

Reply with a number (e.g. 1 or 1,3) to run command suggestions; follow steps for action-type ones; reply skip to dismiss.
```

---

## Install

### Marketplace (recommended)

Add to `~/.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "cc-compass@s554097550": true
  }
}
```

Then install from the marketplace (exact command depends on your Claude Code version).

### Local symlink (dev/try)

```bash
git clone https://github.com/s554097550/cc-compass.git ~/code/cc-compass
ln -s ~/code/cc-compass ~/.claude/plugins/cc-compass
# Restart Claude Code
```

---

## Usage

In Claude Code:

```
/cc-compass
```

Or natural language:

```
What should I do next?
Any suggestions?
help me figure out what to do
```

Reply:
- `1` — run suggestion 1
- `1,3` — run 1 then 3
- `skip` — dismiss

---

## Configuration

`~/.claude/cc-compass.config.json` (user) or `<project>/.claude/cc-compass.config.json` (project):

```json
{
  "aliases": ["cc-compass", "compass"],
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

| Field | Default | Meaning |
|-------|---------|---------|
| `aliases` | `["cc-compass","compass","向导"]` | Trigger aliases |
| `fill_to_n` | `5` | Max suggestions shown |
| `locale` | `auto` | `zh-CN` / `en` / `auto` |
| `advisor.enabled` | `true` | Call model to fill remaining slots when rules don't cover enough |
| `advisor.model` | `null` (required when advisor is on) | Set to a model id your endpoint accepts, e.g. `claude-haiku-4-5-20251001` for the Anthropic API |
| `advisor.base_url` | `null` → inherits `ANTHROPIC_BASE_URL` | Use a compatible third-party endpoint if you want |
| `advisor.auth_token` | `null` → inherits `ANTHROPIC_AUTH_TOKEN` | API key |
| `advisor.always_call` | `false` | Call the advisor even when rules already filled N (smarter but pricier) |
| `advisor.timeout_ms` | `8000` | Advisor request timeout |
| `rules_disabled` | `[]` | Rule ids you want to silence |

Env-var overrides: `CC_COMPASS_FILL_TO_N`, `CC_COMPASS_MODEL`, `CC_COMPASS_ADVISOR_ENABLED`, etc.

### Three modes

| Mode | Config | Behavior |
|------|--------|----------|
| **Rules-only** (free, zero outbound) | `advisor.enabled: false` | Local rules only |
| **Hybrid** (default) | `advisor.enabled: true, always_call: false` | Rules first, Haiku fills the gap |
| **Model-first** | `advisor.enabled: true, always_call: true` | Always ask the advisor, rules as fallback |

---

## Privacy

cc-compass runs **only on explicit invocation** — there is no background hook.

In **rules-only mode**, no outbound requests are made at all.

In **hybrid / model-first mode**, the advisor receives:
- Recent transcript summary (truncated by `max_transcript_tokens`)
- Current cwd's base name (not the full path)
- Whether it's a git repo, whether CLAUDE.md exists
- The scenario catalog (`scenarios.yaml`)

It does **not** send: env vars (beyond what's needed for the API call), file contents, full paths, usernames, hostnames.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `[cc-compass] advisor needs ANTHROPIC_AUTH_TOKEN` | No API key visible to the advisor | Set `ANTHROPIC_AUTH_TOKEN`, or `advisor.auth_token` in config, or `advisor.enabled: false` for rules-only mode |
| `advisor HTTP 400: model not found` | The default model id isn't routable on your endpoint | Set `advisor.model` to a model your endpoint accepts |
| `advisor response was not valid JSON: ...` | The advisor returned prose instead of JSON | Try a stronger model, or rerun — usually transient |
| "No suggestions" right after `/cc-compass` | Rules didn't fire and advisor was disabled / unauthorized | Provide more context in your prompt, enable the advisor, or open an issue with the situation that should have matched |
| Suggestion list shown but Claude doesn't execute reply `1` | The skill output was hidden or the assistant didn't keep the machine-readable block | Re-run `/cc-compass` and ensure your assistant follows `SKILL.md` |

---

## Extending

Adding a new suggestion = two edits:

1. `lib/rules/index.mjs` — add a rule (optional, for the rule layer fallback)
2. `scenarios.yaml` — add a scenario entry (required, feeds the advisor)

PRs adding scenarios are welcome!

---

## License

MIT
