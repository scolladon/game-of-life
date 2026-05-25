// Check §2.3 — Instructions (CLAUDE.md) + seed moteur core/.
//
// Valide que :
//   - CLAUDE.md conserve l'existant (@AGENTS.md + section Modèles de §2.1) ;
//   - CLAUDE.md ajoute Stack, Architecture, Conventions ;
//   - la couche core/ est documentée comme pure (règle dure) ;
//   - src/core/grid.ts exporte createGrid + getCell ;
//   - src/core/step.ts exporte step ;
//   - au moins 2 fichiers de tests dans src/core/*.test.ts ;
//   - vitest run src/core passe (step Conway fonctionne vraiment) ;
//   - aucun secret en clair n'a été glissé dans CLAUDE.md.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const CLAUDE_MD = 'CLAUDE.md';
const GRID_TS = 'src/core/grid.ts';
const STEP_TS = 'src/core/step.ts';
const CORE_DIR = 'src/core';
const errors: string[] = [];

// 1. CLAUDE.md présent + préservation @AGENTS.md + section Modèles (régression §2.1).
if (!existsSync(CLAUDE_MD)) {
  errors.push(`Fichier introuvable : ${CLAUDE_MD}`);
} else {
  const content = readFileSync(CLAUDE_MD, 'utf-8');

  if (!/@AGENTS\.md/.test(content)) {
    errors.push("La référence `@AGENTS.md` a disparu de CLAUDE.md (à conserver).");
  }

  if (!/##\s+Mod[èe]les/i.test(content)) {
    errors.push(
      "La section `## Modèles…` de §2.1 a disparu de CLAUDE.md (régression — étendre, pas écraser).",
    );
  }

  // 2. Sections attendues en §2.3.
  const expectedSections: { name: string; pattern: RegExp }[] = [
    { name: '## Stack', pattern: /##\s+Stack\b/i },
    { name: '## Architecture', pattern: /##\s+Architecture\b/i },
    { name: '## Conventions', pattern: /##\s+Conventions\b/i },
  ];
  for (const { name, pattern } of expectedSections) {
    if (!pattern.test(content)) {
      errors.push(`Section manquante dans CLAUDE.md : \`${name}\`.`);
    }
  }

  // 3. core/ documenté comme pur (règle dure).
  const archMatch = content.match(/##\s+Architecture[\s\S]+?(?=\n##\s|$)/i);
  if (archMatch) {
    const arch = archMatch[0];
    const mentionsCore = /\bcore\/?\b/i.test(arch);
    const mentionsPurity = /(pur(e|es|es?)?|sans\s+d[ée]pendance|z[ée]ro\s+d[ée]pendance)/i.test(arch);
    if (!mentionsCore || !mentionsPurity) {
      errors.push(
        "La section Architecture doit mentionner `core/` ET sa contrainte de pureté (`pur`, `sans dépendance` ou `zéro dépendance`).",
      );
    }
  }

  // 4. Anti-leak.
  if (
    /sk-ant-[A-Za-z0-9_-]{8,}/.test(content) ||
    /ANTHROPIC_API_KEY\s*[:=]\s*["'][^"']+["']/.test(content)
  ) {
    errors.push(
      "Secret détecté dans CLAUDE.md (sk-ant-… ou ANTHROPIC_API_KEY). Les secrets ne vivent pas dans CLAUDE.md.",
    );
  }
}

// 5. src/core/grid.ts + exports attendus.
if (!existsSync(GRID_TS)) {
  errors.push(`Fichier introuvable : ${GRID_TS}`);
} else {
  const grid = readFileSync(GRID_TS, 'utf-8');
  if (!/export\s+(function|const)\s+createGrid\b/.test(grid)) {
    errors.push(`${GRID_TS} doit exporter \`createGrid\`.`);
  }
  if (!/export\s+(function|const)\s+getCell\b/.test(grid)) {
    errors.push(`${GRID_TS} doit exporter \`getCell\`.`);
  }
}

// 6. src/core/step.ts + export attendu.
if (!existsSync(STEP_TS)) {
  errors.push(`Fichier introuvable : ${STEP_TS}`);
} else {
  const stepSrc = readFileSync(STEP_TS, 'utf-8');
  if (!/export\s+(function|const)\s+step\b/.test(stepSrc)) {
    errors.push(`${STEP_TS} doit exporter \`step\`.`);
  }
}

// 7. Au moins 2 fichiers de tests dans src/core/.
if (existsSync(CORE_DIR)) {
  const testFiles = readdirSync(CORE_DIR).filter((f) => /\.(test|spec)\.tsx?$/.test(f));
  if (testFiles.length < 2) {
    errors.push(
      `src/core/ doit contenir au moins 2 fichiers de tests (\`*.test.ts\`) ; trouvé : ${testFiles.length}.`,
    );
  }
}

// 8. vitest run src/core passe (step Conway marche réellement).
if (errors.length === 0) {
  const result = spawnSync('npx', ['vitest', 'run', 'src/core'], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    errors.push(
      `\`npx vitest run src/core\` a échoué (exit ${result.status}). Sortie :\n${result.stdout ?? ''}\n${result.stderr ?? ''}`,
    );
  }
}

if (errors.length === 0) {
  console.log('✅ check-2.3');
  console.log('   ↳ CLAUDE.md complet (Stack + Architecture + Conventions),');
  console.log('     core/ documenté comme pur, moteur grid+step en place et testé.');
  console.log('');
  console.log('💡 Concept §2.3 — CLAUDE.md est le contrat du projet : Claude le');
  console.log('   lit à chaque session. La règle « core/ pur » écrite ici sera');
  console.log('   défendue automatiquement en §2.4 (hooks) et §2.8 (architect-reviewer).');
  process.exit(0);
}

console.log('❌ check-2.3');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §2.3 mise en place (ou prompts/2.3.md en bouée).');
process.exit(1);
