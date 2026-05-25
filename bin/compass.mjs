#!/usr/bin/env node
// cc-compass main entry. Invoked by the cc-compass skill.
import { loadConfig } from '../lib/config.mjs';
import { buildContext } from '../lib/context.mjs';
import { runRules } from '../lib/rules/index.mjs';
import { askAdvisor } from '../lib/advisor.mjs';
import { format } from '../lib/formatter.mjs';

async function main() {
  const cfg = await loadConfig();
  const ctx = await buildContext(cfg);

  let hits = await runRules(ctx, cfg);

  const need = cfg.fill_to_n - hits.length;
  const shouldCallAdvisor = cfg.advisor.enabled && (cfg.advisor.always_call || need > 0);

  if (shouldCallAdvisor && !cfg.advisor.model) {
    process.stderr.write(
      '[cc-compass] advisor needs a model id (set advisor.model in config or CC_COMPASS_MODEL). ' +
      'Set advisor.enabled=false for rules-only mode.\n'
    );
  } else if (shouldCallAdvisor && !cfg.advisor.auth_token) {
    process.stderr.write(
      '[cc-compass] advisor needs ANTHROPIC_AUTH_TOKEN (or advisor.auth_token in config). ' +
      'Set advisor.enabled=false for rules-only mode.\n'
    );
  } else if (shouldCallAdvisor) {
    try {
      const extra = await askAdvisor(ctx, hits, cfg, Math.max(need, 0));
      const seen = new Set(hits.map(h => h.id));
      for (const e of extra) {
        if (!seen.has(e.id)) {
          hits.push(e);
          seen.add(e.id);
        }
      }
    } catch (err) {
      process.stderr.write(`[cc-compass] advisor failed: ${err.message}\n`);
    }
  }

  if (hits.length === 0) {
    process.stdout.write(
      '🧭 cc-compass：当前情境下暂无特别建议。继续按你的节奏即可，需要帮助随时再 /cc-compass。\n'
    );
    return;
  }

  hits = hits.slice(0, cfg.fill_to_n);
  process.stdout.write(format(hits, cfg));
}

main().catch(err => {
  process.stderr.write(`[cc-compass] fatal: ${err.stack || err.message}\n`);
  process.exit(1);
});
