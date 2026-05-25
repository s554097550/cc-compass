// Build situational context from env hints.
import { existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

export async function buildContext(cfg) {
  const cwd = process.env.CC_COMPASS_CWD || process.cwd();
  const recent = process.env.CC_COMPASS_RECENT || '';
  const userPrompt = process.env.CC_COMPASS_PROMPT || '';

  let isGitRepo = false;
  try {
    isGitRepo = existsSync(join(cwd, '.git'));
  } catch {}

  let hasClaudeMd = false;
  try {
    hasClaudeMd = existsSync(join(cwd, 'CLAUDE.md'));
  } catch {}

  const recentText = recent.slice(-cfg.advisor.max_transcript_tokens * 4);
  const recentLength = recent.length;
  const turnEstimate = (recent.match(/\n---\n/g) || []).length + 1;

  return {
    cwd,
    cwdName: basename(cwd),
    isGitRepo,
    hasClaudeMd,
    recentText,
    recentLength,
    turnEstimate,
    userPrompt,
    locale: cfg.locale,
    now: new Date(),
  };
}
