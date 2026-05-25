// Advisor: call Anthropic Messages API (or compatible endpoint) to fill suggestions.
// Stateless — never reuses the main conversation.
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCENARIOS_PATH = join(__dirname, '..', 'scenarios.yaml');

let cachedScenarios = null;
async function loadScenariosRaw() {
  if (cachedScenarios !== null) return cachedScenarios;
  try {
    cachedScenarios = await readFile(SCENARIOS_PATH, 'utf8');
  } catch {
    process.stderr.write('[cc-compass] scenarios.yaml not found — advisor will have limited context.\n');
    cachedScenarios = '';
  }
  return cachedScenarios;
}

function buildSystemPrompt(locale) {
  if (locale === 'en') {
    return `You are cc-compass, a Claude Code guide. Based on the user's recent context, pick the most relevant suggestions from the scenario catalog. Each suggestion MUST include a reason explaining why it's relevant NOW. Output STRICT JSON only:
{"suggestions":[{"id":"<scenario id>","type":"cmd"|"action","command":"<for cmd>","title":"<for action>","reason":"<concrete why, <=80 chars>","steps":["..."]}]}
- Use ids from the catalog when possible. New ones allowed if needed.
- Skip suggestions already in <already_hit>.
- Return at most <need> items.
- Be concrete in reason — reference what the user actually said.`;
  }
  return `你是 cc-compass，Claude Code 使用向导。根据用户最近的上下文，从场景库挑出最相关的建议。每条必须给出"为什么此刻推荐"的具体原因。只输出严格 JSON：
{"suggestions":[{"id":"<场景 id>","type":"cmd"|"action","command":"<cmd 类填>","title":"<action 类填>","reason":"<具体原因，<=80 字>","steps":["..."]}]}
- 优先复用场景库里的 id，必要时可新增
- 跳过 <already_hit> 里已有的
- 最多返回 <need> 条
- 原因要具体，引用用户实际说了什么`;
}

function buildUserPrompt(ctx, hits, need) {
  return [
    '<scenarios>',
    ctx._scenariosCombined,
    '</scenarios>',
    '',
    '<context>',
    `cwd: ${ctx.cwdName}`,
    `is_git_repo: ${ctx.isGitRepo}`,
    `has_claude_md: ${ctx.hasClaudeMd}`,
    `turn_estimate: ${ctx.turnEstimate}`,
    `recent_length: ${ctx.recentLength}`,
    '',
    'recent_transcript:',
    ctx.recentText || '(none)',
    '',
    'user_current_prompt:',
    ctx.userPrompt || '(none)',
    '</context>',
    '',
    '<already_hit>',
    hits.map(h => h.id).join(', ') || '(none)',
    '</already_hit>',
    '',
    `<need>${need}</need>`,
  ].join('\n');
}

function extractJson(text) {
  // Try direct parse first.
  try {
    return JSON.parse(text);
  } catch {}
  // Try fenced block.
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) {
    try {
      return JSON.parse(m[1]);
    } catch {}
  }
  // Try to grab first {...} blob.
  const a = text.indexOf('{');
  const b = text.lastIndexOf('}');
  if (a >= 0 && b > a) {
    try {
      return JSON.parse(text.slice(a, b + 1));
    } catch {}
  }
  throw new Error('advisor response was not valid JSON: ' + String(text).slice(0, 200));
}

export async function askAdvisor(ctx, hits, cfg, need) {
  const advisor = cfg.advisor;
  if (!advisor.auth_token) {
    throw new Error('no auth_token configured (set ANTHROPIC_AUTH_TOKEN or cc-compass.config.json)');
  }
  ctx._scenariosRaw = await loadScenariosRaw();
  const extras = cfg.extra_scenarios && cfg.extra_scenarios.length
    ? '\n# user-extra scenarios:\n' + cfg.extra_scenarios.map(s => JSON.stringify(s)).join('\n')
    : '';
  ctx._scenariosCombined = ctx._scenariosRaw + extras;
  const target = Math.max(need, cfg.fill_to_n - hits.length, 1);

  const body = {
    model: advisor.model,
    max_tokens: 800,
    system: buildSystemPrompt(cfg.locale),
    messages: [{ role: 'user', content: buildUserPrompt(ctx, hits, target) }],
  };

  const url = `${advisor.base_url.replace(/\/$/, '')}/v1/messages`;
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), advisor.timeout_ms);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': advisor.auth_token,
        'authorization': `Bearer ${advisor.auth_token}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(tid);
  }

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`advisor HTTP ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');

  const parsed = extractJson(text);
  const out = [];
  for (const s of parsed.suggestions || []) {
    if (!s || !s.reason) continue;
    if (s.type === 'cmd' && !s.command) continue;
    if (s.type === 'action' && !s.title) continue;
    out.push({
      id: s.id || `advisor-${out.length}`,
      type: s.type,
      command: s.command,
      title: s.title,
      reason: s.reason,
      steps: s.steps,
    });
  }
  return out.slice(0, target);
}
