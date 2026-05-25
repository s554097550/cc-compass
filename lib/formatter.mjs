// Render hits as numbered list + machine-readable block.
import { t } from './i18n.mjs';

function escapePipe(s) {
  return String(s || '').replace(/\|/g, '/').replace(/\n/g, ' ');
}

export function format(hits, cfg) {
  const lo = cfg.locale;
  const lines = [];
  lines.push(t('header', lo, { n: hits.length }));
  lines.push('');

  hits.forEach((h, i) => {
    const n = i + 1;
    const label = h.type === 'cmd' ? t('label_cmd', lo) : t('label_action', lo);
    const title = h.type === 'cmd' ? h.command : h.title;
    lines.push(`[${n}] ${label}: ${title}`);
    lines.push(`    ${t('label_reason', lo)}: ${h.reason}`);
    if (h.type === 'cmd') {
      lines.push(`    ${t('label_run_hint', lo, { n })}`);
    } else if (h.steps && h.steps.length) {
      lines.push(`    ${t('label_steps', lo)}:`);
      h.steps.forEach((s, j) => lines.push(`       ${j + 1}. ${s}`));
    }
    lines.push('');
  });

  lines.push(t('reply_hint', lo));
  lines.push('');
  lines.push('<cc-compass-suggestions hidden>');
  hits.forEach((h, i) => {
    const n = i + 1;
    const payload = h.type === 'cmd' ? h.command : h.title;
    lines.push(`${n}|${h.type}|${escapePipe(payload)}|${escapePipe(h.reason)}`);
  });
  lines.push('</cc-compass-suggestions>');
  lines.push('');
  return lines.join('\n');
}
