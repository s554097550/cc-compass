// Config loader: merges env > project > user > defaults.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const DEFAULTS = {
  aliases: ['cc-compass', 'compass', '向导'],
  fill_to_n: 5,
  locale: 'auto',
  advisor: {
    enabled: true,
    model: null,
    base_url: null,
    auth_token: null,
    always_call: false,
    max_transcript_tokens: 1500,
    timeout_ms: 8000,
  },
  rules_disabled: [],
  extra_scenarios: [],
};

function deepMerge(base, override) {
  if (override == null) return base;
  if (Array.isArray(base) || typeof base !== 'object') return override;
  const out = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = (v && typeof v === 'object' && !Array.isArray(v))
      ? deepMerge(base[k] ?? {}, v)
      : v;
  }
  return out;
}

async function readJsonIfExists(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (err) {
    process.stderr.write(`[cc-compass] failed to parse ${path}: ${err.message}\n`);
    return null;
  }
}

function envOverrides() {
  const e = process.env;
  const o = {};
  if (e.CC_COMPASS_FILL_TO_N) o.fill_to_n = parseInt(e.CC_COMPASS_FILL_TO_N, 10);
  if (e.CC_COMPASS_LOCALE) o.locale = e.CC_COMPASS_LOCALE;
  const adv = {};
  if (e.CC_COMPASS_ADVISOR_ENABLED) adv.enabled = e.CC_COMPASS_ADVISOR_ENABLED !== 'false';
  if (e.CC_COMPASS_ALWAYS_CALL) adv.always_call = e.CC_COMPASS_ALWAYS_CALL === 'true';
  if (e.CC_COMPASS_MODEL) adv.model = e.CC_COMPASS_MODEL;
  if (e.CC_COMPASS_BASE_URL) adv.base_url = e.CC_COMPASS_BASE_URL;
  if (e.CC_COMPASS_AUTH_TOKEN) adv.auth_token = e.CC_COMPASS_AUTH_TOKEN;
  if (Object.keys(adv).length) o.advisor = adv;
  return o;
}

export async function loadConfig() {
  const userPath = join(homedir(), '.claude', 'cc-compass.config.json');
  const cwd = process.env.CC_COMPASS_CWD || process.cwd();
  const projectPath = join(cwd, '.claude', 'cc-compass.config.json');

  let cfg = DEFAULTS;
  cfg = deepMerge(cfg, await readJsonIfExists(userPath));
  cfg = deepMerge(cfg, await readJsonIfExists(projectPath));
  cfg = deepMerge(cfg, envOverrides());

  if (!cfg.advisor.base_url) {
    cfg.advisor.base_url = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
  }
  if (!cfg.advisor.auth_token) {
    cfg.advisor.auth_token =
      process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY || null;
  }
  // advisor.model intentionally has no default — different endpoints accept
  // different model ids, and pinning one here causes confusing 400s.
  // Users must set it in config or via CC_COMPASS_MODEL.

  if (cfg.locale === 'auto') {
    const lang = (process.env.LANG || process.env.LC_ALL || '').toLowerCase();
    cfg.locale = lang.startsWith('zh') ? 'zh-CN' : 'en';
  }

  return cfg;
}
