// Tiny i18n. Each entry: { 'zh-CN': '...', en: '...' }.
const dict = {
  header: {
    'zh-CN': '🧭 cc-compass 为你找到 {n} 个建议：',
    en: '🧭 cc-compass found {n} suggestions for you:',
  },
  reply_hint: {
    'zh-CN': '回复数字（如 1 或 1,3）执行命令类建议；操作类按步骤手动操作；回复 skip 跳过。',
    en: 'Reply with a number (e.g. 1 or 1,3) to run command suggestions; follow steps for action-type ones; reply skip to dismiss.',
  },
  label_cmd: { 'zh-CN': '命令', en: 'Command' },
  label_action: { 'zh-CN': '操作', en: 'Action' },
  label_reason: { 'zh-CN': '💡 原因', en: '💡 Why' },
  label_steps: { 'zh-CN': '📋 步骤', en: '📋 Steps' },
  label_run_hint: { 'zh-CN': '👉 回复 {n} 立即执行', en: '👉 Reply {n} to run' },
};

export function t(key, locale, vars = {}) {
  const entry = dict[key];
  if (!entry) return key;
  let s = entry[locale] || entry['en'];
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
