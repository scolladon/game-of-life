// Check §2.4 — Hooks (PostToolUse Biome + PreToolUse garde-fou core/).
//
// Valide que :
//   - .claude/settings.json conserve la clé `permissions` de §2.2 ;
//   - hooks.PostToolUse contient un matcher Edit|Write|MultiEdit qui invoque biome ;
//   - .claude/hooks/guard-core.mjs existe et est référencé depuis hooks.PreToolUse ;
//   - le garde-fou bloque les éditions src/core/<nom>.ts sans sibling *.test.ts ;
//   - le garde-fou laisse passer : sibling présent, fichier test lui-même, hors core/ ;
//   - régression : CLAUDE.md §2.3 intact, core/ moteur testable.
//
// Pédagogie : on teste le *comportement* du hook, pas seulement sa déclaration.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const SETTINGS = '.claude/settings.json';
const GUARD = '.claude/hooks/guard-core.mjs';
const CLAUDE_MD = 'CLAUDE.md';
const errors: string[] = [];

// 1. .claude/settings.json présent + JSON valide + permissions §2.2 préservées.
type HookEntry = { type?: string; command?: string };
type HookGroup = { matcher?: string; hooks?: HookEntry[] };
type Settings = {
  permissions?: { allow?: unknown[]; deny?: unknown[]; ask?: unknown[] };
  hooks?: { PreToolUse?: HookGroup[]; PostToolUse?: HookGroup[] };
};

let settings: Settings | null = null;
if (!existsSync(SETTINGS)) {
  errors.push(`Fichier introuvable : ${SETTINGS}`);
} else {
  try {
    settings = JSON.parse(readFileSync(SETTINGS, 'utf-8')) as Settings;
  } catch (e) {
    errors.push(`${SETTINGS} n'est pas du JSON valide : ${(e as Error).message}`);
  }
}

if (settings) {
  // Régression-guard §2.2 : permissions inchangées.
  const allow = settings.permissions?.allow;
  if (!Array.isArray(allow) || allow.length === 0) {
    errors.push("La clé `permissions.allow` de §2.2 a disparu de .claude/settings.json.");
  }

  // 2. PostToolUse Biome.
  const postGroups = settings.hooks?.PostToolUse ?? [];
  const hasBiome = postGroups.some((g) => {
    const matcher = g.matcher ?? '';
    const matchesEdit = /Edit/.test(matcher) && /Write/.test(matcher);
    const hooks = Array.isArray(g.hooks) ? g.hooks : [];
    return matchesEdit && hooks.some((h) => /biome/.test(h.command ?? ''));
  });
  if (!hasBiome) {
    errors.push(
      'Hook PostToolUse Biome manquant : attendu un groupe avec matcher couvrant Edit|Write et une command invoquant `biome`.',
    );
  }

  // 3. PreToolUse garde-fou.
  const preGroups = settings.hooks?.PreToolUse ?? [];
  const hasGuard = preGroups.some((g) => {
    const matcher = g.matcher ?? '';
    const matchesEdit = /Edit/.test(matcher) && /Write/.test(matcher);
    const hooks = Array.isArray(g.hooks) ? g.hooks : [];
    return matchesEdit && hooks.some((h) => /guard-core\.mjs/.test(h.command ?? ''));
  });
  if (!hasGuard) {
    errors.push(
      'Hook PreToolUse garde-fou manquant : attendu un groupe avec matcher couvrant Edit|Write et une command invoquant `.claude/hooks/guard-core.mjs`.',
    );
  }
}

// 4. .claude/hooks/guard-core.mjs présent.
if (!existsSync(GUARD)) {
  errors.push(`Fichier introuvable : ${GUARD}`);
}

// 5. Comportement du garde-fou — 4 scénarios.
type Scenario = {
  label: string;
  filePath: string;
  expectBlock: boolean;
};
const scenarios: Scenario[] = [
  { label: 'core/ avec test sibling', filePath: 'src/core/grid.ts', expectBlock: false },
  { label: 'core/ sans test sibling', filePath: 'src/core/__guard_probe__.ts', expectBlock: true },
  { label: 'fichier test lui-même', filePath: 'src/core/grid.test.ts', expectBlock: false },
  { label: 'hors core/', filePath: 'src/app/page.tsx', expectBlock: false },
];

if (existsSync(GUARD)) {
  for (const sc of scenarios) {
    const payload = JSON.stringify({
      tool_name: 'Edit',
      tool_input: { file_path: sc.filePath },
    });
    const res = spawnSync('node', [GUARD], { input: payload, encoding: 'utf-8' });
    if (res.status !== 0) {
      errors.push(
        `${GUARD} doit toujours exit 0 (décision portée par stdout JSON) — exit ${res.status} pour ${sc.filePath}`,
      );
      continue;
    }
    const stdout = res.stdout ?? '';
    let blocked = false;
    if (stdout.trim().length > 0) {
      try {
        const parsed = JSON.parse(stdout);
        blocked = parsed?.hookSpecificOutput?.permissionDecision === 'deny';
      } catch {
        errors.push(`${GUARD} a produit du stdout non-JSON pour ${sc.filePath} : ${stdout}`);
        continue;
      }
    }
    if (blocked !== sc.expectBlock) {
      const expected = sc.expectBlock ? 'BLOCK (deny)' : 'PASS (silencieux)';
      const got = blocked ? 'BLOCK (deny)' : 'PASS (silencieux)';
      errors.push(`${sc.label} (${sc.filePath}) — attendu ${expected}, obtenu ${got}.`);
    }
  }
}

// 6. Régression-guard §2.3 : CLAUDE.md conserve les sections clés + moteur core/ testable.
if (existsSync(CLAUDE_MD)) {
  const content = readFileSync(CLAUDE_MD, 'utf-8');
  if (!/@AGENTS\.md/.test(content)) {
    errors.push('CLAUDE.md a perdu la référence `@AGENTS.md` (régression §2.3).');
  }
  if (!/##\s+Architecture\b/i.test(content)) {
    errors.push('CLAUDE.md a perdu la section `## Architecture` (régression §2.3).');
  }
  if (!/##\s+Mod[èe]les/i.test(content)) {
    errors.push('CLAUDE.md a perdu la section `## Modèles…` (régression §2.1).');
  }
} else {
  errors.push(`Fichier introuvable : ${CLAUDE_MD}`);
}

if (errors.length === 0) {
  const vitest = spawnSync('npx', ['vitest', 'run', 'src/core'], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (vitest.status !== 0) {
    errors.push(
      `\`npx vitest run src/core\` a échoué (exit ${vitest.status}). Sortie :\n${vitest.stdout ?? ''}\n${vitest.stderr ?? ''}`,
    );
  }
}

if (errors.length === 0) {
  console.log('✅ check-2.4');
  console.log('   ↳ Hooks posés : PostToolUse Biome + PreToolUse garde-fou core/.');
  console.log('     Garde-fou validé sur 4 scénarios. Régression §2.1/§2.2/§2.3 OK.');
  console.log('');
  console.log('💡 Concept §2.4 — un hook transforme une règle écrite (CLAUDE.md)');
  console.log('   en règle imposée. Le repo défend maintenant lui-même la pureté');
  console.log('   de core/, indépendamment du modèle, du prompt et du participant.');
  process.exit(0);
}

console.log('❌ check-2.4');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §2.4 mise en place (ou prompts/2.4.md en bouée).');
process.exit(1);
