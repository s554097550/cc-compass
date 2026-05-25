// Rule registry. Each rule: { id, priority, match(ctx) -> hit | null }
// A hit: { id, type:'cmd'|'action', command?, title?, reason, steps? }
//
// For MVP we keep all rules in one file to ease browsing. Each rule is small
// and pure; adding a new one is a few lines.

const has = (text, ...patterns) => {
  const s = String(text || '').toLowerCase();
  return patterns.some(p => s.includes(p.toLowerCase()));
};

const recent = ctx => `${ctx.recentText}\n${ctx.userPrompt}`;

export const RULES = [
  {
    id: 'long-session',
    priority: 100,
    match: ctx => {
      if (ctx.recentLength > 40000 || ctx.turnEstimate > 80) {
        return {
          type: 'cmd',
          command: '/compact',
          reason: `当前会话已较长（约 ${ctx.turnEstimate} 轮 / ${(ctx.recentLength/1024).toFixed(0)}KB），压缩可释放上下文容量`,
        };
      }
      return null;
    },
  },
  {
    id: 'enter-worktree',
    priority: 90,
    match: ctx => {
      if (has(recent(ctx), '重构', '大改', '改造', 'refactor', 'rewrite', '迁移', '实验', '试一下')) {
        return {
          type: 'cmd',
          command: 'EnterWorktree',
          reason: '看起来要做较大或实验性改动，进入 worktree 可隔离当前分支，失败可整体丢弃',
        };
      }
      return null;
    },
  },
  {
    id: 'enter-plan',
    priority: 88,
    match: ctx => {
      if (has(recent(ctx), '我想', '想做', '怎么设计', '架构', '方案', 'design', 'architect', '帮我搞', '帮我做')) {
        return {
          type: 'cmd',
          command: 'EnterPlanMode',
          reason: '需求较开放或涉及设计决策，先进入 plan 模式对齐方案再动手能减少返工',
        };
      }
      return null;
    },
  },
  {
    id: 'commit',
    priority: 80,
    match: ctx => {
      if (has(recent(ctx), '提交', 'commit', 'push', '推上去', '提个 pr', '发 pr')) {
        return {
          type: 'cmd',
          command: '/commit',
          reason: '你提到了提交，/commit 可生成规范的 conventional commit message',
        };
      }
      return null;
    },
  },
  {
    id: 'review',
    priority: 78,
    match: ctx => {
      if (has(recent(ctx), 'review', '审核', '复查', '检查代码', '看看代码', 'pr 准备')) {
        return {
          type: 'cmd',
          command: '/review',
          reason: '代码改动较多，/review 可帮你过一遍质量；涉及安全可用 /security-review',
        };
      }
      return null;
    },
  },
  {
    id: 'simplify',
    priority: 60,
    match: ctx => {
      if (has(recent(ctx), '写完了', '搞定了', 'done', '完成了')) {
        return {
          type: 'cmd',
          command: '/simplify',
          reason: '完成一段实现后，/simplify 可检查重复、抽象与效率问题',
        };
      }
      return null;
    },
  },
  {
    id: 'skill-lark-mail',
    priority: 70,
    match: ctx => {
      if (has(recent(ctx), '邮件', '发信', '草稿', '收件箱', 'email', 'mail')) {
        return {
          type: 'cmd',
          command: '/lark-mail',
          reason: '提到了邮件，lark-mail skill 可直接收发飞书邮件',
        };
      }
      return null;
    },
  },
  {
    id: 'skill-lark-doc',
    priority: 70,
    match: ctx => {
      if (has(recent(ctx), '飞书文档', '云文档', '知识库', 'wiki', '飞书 doc')) {
        return {
          type: 'cmd',
          command: '/lark-doc',
          reason: '涉及飞书文档操作，lark-doc / lark-wiki skill 可直接读写',
        };
      }
      return null;
    },
  },
  {
    id: 'skill-lark-calendar',
    priority: 70,
    match: ctx => {
      if (has(recent(ctx), '日程', '会议', '约时间', '日历', 'calendar', 'meeting')) {
        return {
          type: 'cmd',
          command: '/lark-calendar',
          reason: '涉及日程或会议，lark-calendar skill 可查询/创建',
        };
      }
      return null;
    },
  },
  {
    id: 'skill-lark-im',
    priority: 68,
    match: ctx => {
      if (has(recent(ctx), '发消息', '群聊', '聊天记录', '飞书消息', 'im')) {
        return {
          type: 'cmd',
          command: '/lark-im',
          reason: '飞书消息相关，lark-im skill 可收发与搜索聊天',
        };
      }
      return null;
    },
  },
  {
    id: 'skill-lark-base',
    priority: 65,
    match: ctx => {
      if (has(recent(ctx), '多维表格', 'bitable', '飞书 base')) {
        return {
          type: 'cmd',
          command: '/lark-base',
          reason: '涉及多维表格，lark-base skill 提供建表 / 字段 / 记录读写',
        };
      }
      return null;
    },
  },
  {
    id: 'agent-explore',
    priority: 55,
    match: ctx => {
      if (has(recent(ctx), '哪里', '在哪', '找一下', '搜一下', '探索', 'where is', 'search for')) {
        return {
          type: 'action',
          title: '使用 Explore subagent 做广度搜索',
          reason: '跨多目录或不确定位置的搜索，交给 Explore subagent 可节省主上下文',
          steps: [
            '直接告诉我："用 Explore agent 找 <关键词>"',
            '我会用 Agent 工具并指定 subagent_type=Explore',
            'agent 会返回精炼结果，不污染主对话',
          ],
        };
      }
      return null;
    },
  },
  {
    id: 'permission-fatigue',
    priority: 50,
    match: ctx => {
      if (has(recent(ctx), '老问我权限', '一直让我同意', 'permission prompt', '总是让我授权')) {
        return {
          type: 'cmd',
          command: '/fewer-permission-prompts',
          reason: '频繁授权打断节奏，可扫描历史并生成 allowlist',
        };
      }
      return null;
    },
  },
  {
    id: 'memory-save',
    priority: 45,
    match: ctx => {
      if (has(recent(ctx), '记住', '下次', '以后', 'remember', 'from now on')) {
        return {
          type: 'action',
          title: '把这条偏好写入 memory',
          reason: '你提到"下次/以后"，写入 memory 可让未来会话自动加载',
          steps: [
            '告诉我："把刚才那条规则记到 memory"',
            '我会写到 ~/.claude/projects/<project>/memory/ 下',
            '注意：自动行为类需要的是 hook，不是 memory；这种我会改用 /update-config',
          ],
        };
      }
      return null;
    },
  },
  {
    id: 'statusline',
    priority: 40,
    match: ctx => {
      if (has(recent(ctx), '状态栏', 'statusline', '显示在底部', '一直显示')) {
        return {
          type: 'cmd',
          command: '/statusline-setup',
          reason: '想常驻显示信息，statusline 是合适的位置',
        };
      }
      return null;
    },
  },
  {
    id: 'loop',
    priority: 38,
    match: ctx => {
      if (has(recent(ctx), '定时', '每隔', '反复执行', '轮询', 'poll', 'every n')) {
        return {
          type: 'cmd',
          command: '/loop',
          reason: '需要定时或重复执行，/loop 可周期触发命令',
        };
      }
      return null;
    },
  },
  {
    id: 'init-claudemd',
    priority: 35,
    match: ctx => {
      if (!ctx.hasClaudeMd && ctx.isGitRepo) {
        return {
          type: 'cmd',
          command: '/init',
          reason: '当前项目无 CLAUDE.md，/init 可生成基础说明，让我更理解你的代码库',
        };
      }
      return null;
    },
  },
  {
    id: 'keybindings',
    priority: 30,
    match: ctx => {
      if (has(recent(ctx), '快捷键', 'keybinding', 'shortcut', '绑定键')) {
        return {
          type: 'cmd',
          command: '/keybindings-help',
          reason: '想改键位绑定，/keybindings-help 可指导配置',
        };
      }
      return null;
    },
  },
  {
    id: 'update-config',
    priority: 32,
    match: ctx => {
      if (has(recent(ctx), 'settings.json', '自动执行', '每次都', '总是', 'hook', '钩子')) {
        return {
          type: 'cmd',
          command: '/update-config',
          reason: '涉及 settings 或"自动 X"需求，/update-config 会用 hook 实现而非记忆',
        };
      }
      return null;
    },
  },
  {
    id: 'security-review',
    priority: 28,
    match: ctx => {
      if (has(recent(ctx), '安全', '漏洞', 'security', '注入', 'xss', 'sql injection')) {
        return {
          type: 'cmd',
          command: '/security-review',
          reason: '涉及安全敏感改动，跑一遍 /security-review 更稳',
        };
      }
      return null;
    },
  },
  {
    id: 'skill-maker',
    priority: 20,
    match: ctx => {
      if (has(recent(ctx), '封装成', '复用', '做个 skill', '做成命令')) {
        return {
          type: 'cmd',
          command: '/lark-skill-maker',
          reason: '想把流程做成可复用 skill，lark-skill-maker 可生成模板（飞书相关）',
        };
      }
      return null;
    },
  },
  {
    id: 'stale-clear',
    priority: 10,
    match: ctx => {
      if (ctx.turnEstimate > 30 && has(ctx.userPrompt, '换个话题', '新的事', 'next topic', '另一个问题')) {
        return {
          type: 'cmd',
          command: '/clear',
          reason: '话题切换且会话已较长，/clear 可避免旧上下文干扰',
        };
      }
      return null;
    },
  },
];

export async function runRules(ctx, cfg) {
  const disabled = new Set(cfg.rules_disabled || []);
  const out = [];
  const sorted = [...RULES].sort((a, b) => b.priority - a.priority);
  for (const r of sorted) {
    if (disabled.has(r.id)) continue;
    try {
      const hit = r.match(ctx);
      if (hit) out.push({ id: r.id, ...hit });
    } catch (err) {
      process.stderr.write(`[cc-compass] rule ${r.id} threw: ${err.message}\n`);
    }
  }
  return out;
}
