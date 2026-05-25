// Check §2.2 — Hiérarchie des settings.
//
// Valide que le projet a un `.claude/settings.json` versionné, sensé et
// pédagogique :
//   - JSON valide.
//   - `permissions.allow` non vide, autorise au moins Bash(npm:*) et Bash(tsx:*).
//   - `permissions.deny` non vide, bloque au moins une opération destructrice
//     (rm -rf ou git push --force).
//   - `permissions.ask` déclaré (peut être vide — mais la clé existe, on
//     enseigne les 3 buckets).
//   - `.gitignore` ignore les settings locaux (.claude/settings.local.json
//     ou un glob équivalent).
//   - Anti-leak : pas de clé API en clair.

import { existsSync, readFileSync } from 'node:fs';

const SETTINGS = '.claude/settings.json';
const GITIGNORE = '.gitignore';
const errors: string[] = [];

if (!existsSync(SETTINGS)) {
  errors.push(`Fichier introuvable : ${SETTINGS}`);
} else {
  const raw = readFileSync(SETTINGS, 'utf-8');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    errors.push(`${SETTINGS} n'est pas du JSON valide : ${(err as Error).message}`);
  }

  // Anti-leak : pas de secret en clair dans le settings versionné.
  if (/sk-ant-[A-Za-z0-9_-]{8,}/.test(raw) || /ANTHROPIC_API_KEY\s*[:=]\s*["'][^"']+["']/.test(raw)) {
    errors.push(
      "Secret détecté dans settings.json (sk-ant-… ou ANTHROPIC_API_KEY). Les secrets vont dans `.claude/settings.local.json` (ignoré par git).",
    );
  }

  if (parsed && typeof parsed === 'object') {
    const root = parsed as Record<string, unknown>;
    const permissions = root.permissions as Record<string, unknown> | undefined;

    if (!permissions || typeof permissions !== 'object') {
      errors.push("Clé `permissions` absente ou invalide dans settings.json.");
    } else {
      const allow = permissions.allow;
      const deny = permissions.deny;
      const ask = permissions.ask;

      // allow non vide + couvre npm/tsx
      if (!Array.isArray(allow) || allow.length === 0) {
        errors.push("`permissions.allow` doit être un tableau non vide.");
      } else {
        const allowStr = allow.filter((x): x is string => typeof x === 'string');
        const hasNpm = allowStr.some((rule) => /^Bash\(npm/i.test(rule));
        const hasTsx = allowStr.some((rule) => /^Bash\(tsx/i.test(rule));
        if (!hasNpm) {
          errors.push("`permissions.allow` doit contenir une règle `Bash(npm:*)` (scripts du projet).");
        }
        if (!hasTsx) {
          errors.push("`permissions.allow` doit contenir une règle `Bash(tsx:*)` (checks TypeScript).");
        }
      }

      // deny non vide + au moins une règle destructrice
      if (!Array.isArray(deny) || deny.length === 0) {
        errors.push("`permissions.deny` doit être un tableau non vide.");
      } else {
        const denyStr = deny.filter((x): x is string => typeof x === 'string');
        const hasDestructive = denyStr.some((rule) =>
          /(rm\s+-rf|git\s+push\s+--force)/i.test(rule),
        );
        if (!hasDestructive) {
          errors.push(
            "`permissions.deny` doit bloquer au moins une opération destructrice (`rm -rf` ou `git push --force`).",
          );
        }
      }

      // ask déclaré (clé présente, même si tableau vide)
      if (!('ask' in permissions) || !Array.isArray(ask)) {
        errors.push(
          "`permissions.ask` doit être déclaré (au minimum un tableau vide) — on enseigne les 3 buckets allow/deny/ask.",
        );
      }
    }
  }
}

// .gitignore ignore les settings locaux
if (!existsSync(GITIGNORE)) {
  errors.push(`Fichier introuvable : ${GITIGNORE}`);
} else {
  const gitignore = readFileSync(GITIGNORE, 'utf-8');
  const ignoresLocal =
    /^\.claude\/settings\.local\.json\s*$/m.test(gitignore) ||
    /^\.claude\/\*\.local\.json\s*$/m.test(gitignore) ||
    /^\.claude\/.*local.*\s*$/im.test(gitignore);
  if (!ignoresLocal) {
    errors.push(
      "`.gitignore` doit ignorer `.claude/settings.local.json` (ou un glob équivalent) — sinon les overrides perso/secrets finissent versionnés.",
    );
  }
}

if (errors.length === 0) {
  console.log('✅ check-2.2');
  console.log('   ↳ .claude/settings.json présent, permissions allow/deny/ask déclarées,');
  console.log('     .gitignore protège les overrides locaux.');
  console.log('');
  console.log('💡 Concept §2.2 — un settings.json projet versionné fixe le contrat');
  console.log('   d\'équipe (ce que Claude a le droit de faire dans CE projet). Les');
  console.log('   overrides perso vont dans settings.local.json, jamais commité.');
  process.exit(0);
}

console.log('❌ check-2.2');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §2.2 mise en place (ou prompts/2.2.md en bouée).');
process.exit(1);
