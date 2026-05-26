// Check §2.8 — Agents (code-reviewer + architect-reviewer + test-writer) + preuve d'usage.
//
// Valide que :
//   - .claude/agents/{code-reviewer,architect-reviewer,test-writer}.md existent ;
//   - chaque agent a un frontmatter `name` + `description` non-vides ;
//   - le `name` du frontmatter correspond au nom de fichier (cohérence routing) ;
//   - preuve d'usage : src/core/patterns.ts expose PATTERN_NAMES + getPattern + PatternName ;
//   - preuve d'usage : src/components/PatternSelector.tsx existe et est monté dans Board.tsx ;
//   - preuve d'usage : Board.tsx remet la génération à 0 sur changement de pattern.
//
// Les agents sont au scope projet (versionnés) — même nature que les skills §2.7
// et les MCP §2.6, miroir inverse du plugin §2.5 (scope user).
//
// Le déclenchement effectif d'un agent par Claude (description-based dispatch ou
// mention `@nom`) n'est pas vérifiable statiquement : on valide la présence et
// la structure. La preuve d'usage est l'artefact produit.

import { existsSync, readFileSync } from 'node:fs';

const CODE_REVIEWER = '.claude/agents/code-reviewer.md';
const ARCHITECT_REVIEWER = '.claude/agents/architect-reviewer.md';
const TEST_WRITER = '.claude/agents/test-writer.md';
const PATTERNS_PATH = 'src/core/patterns.ts';
const PATTERNS_TEST_PATH = 'src/core/patterns.test.ts';
const SELECTOR_PATH = 'src/components/PatternSelector.tsx';
const BOARD_PATH = 'src/components/Board.tsx';
const errors: string[] = [];

type Frontmatter = {
  readonly name?: string;
  readonly description?: string;
};

function parseFrontmatter(content: string): { fm: Frontmatter; body: string } | null {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(content);
  if (!match) return null;
  const [, raw, body] = match;
  const fm: Record<string, string> = {};
  for (const line of (raw ?? '').split('\n')) {
    const kv = /^([a-zA-Z_-]+):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1] as string] = (kv[2] ?? '').trim();
  }
  return { fm: fm as Frontmatter, body: body ?? '' };
}

function checkAgent(path: string, expectedName: string): void {
  if (!existsSync(path)) {
    errors.push(`Agent introuvable : ${path}. Voir prompts/2.8.md.`);
    return;
  }
  const parsed = parseFrontmatter(readFileSync(path, 'utf-8'));
  if (!parsed) {
    errors.push(
      `${path} : frontmatter YAML absent ou malformé (attendu \`---\\nname: …\\ndescription: …\\n---\`).`,
    );
    return;
  }
  const { fm } = parsed;
  if (!fm.name || fm.name.length === 0) {
    errors.push(`${path} : frontmatter \`name\` vide.`);
  } else if (fm.name !== expectedName) {
    errors.push(
      `${path} : frontmatter \`name\` doit valoir \`${expectedName}\` (vu : \`${fm.name}\`).`,
    );
  }
  if (!fm.description || fm.description.length < 30) {
    errors.push(
      `${path} : frontmatter \`description\` absent ou trop court (< 30 caractères). C'est ce que Claude lit pour décider de déléguer à l'agent.`,
    );
  }
}

// 1. Les 3 agents présents + frontmatter conforme.
checkAgent(CODE_REVIEWER, 'code-reviewer');
checkAgent(ARCHITECT_REVIEWER, 'architect-reviewer');
checkAgent(TEST_WRITER, 'test-writer');

// 2. Catalogue de patterns dans core/ (pur, testable).
if (!existsSync(PATTERNS_PATH)) {
  errors.push(`Fichier introuvable : ${PATTERNS_PATH}.`);
} else {
  const patterns = readFileSync(PATTERNS_PATH, 'utf-8');
  if (!/export\s+type\s+PatternName\b/.test(patterns)) {
    errors.push(`${PATTERNS_PATH} doit exporter le type \`PatternName\`.`);
  }
  if (!/export\s+const\s+PATTERN_NAMES\b/.test(patterns)) {
    errors.push(`${PATTERNS_PATH} doit exporter la constante \`PATTERN_NAMES\`.`);
  }
  if (!/export\s+function\s+getPattern\b/.test(patterns)) {
    errors.push(`${PATTERNS_PATH} doit exporter la fonction \`getPattern(name)\`.`);
  }
  // Pureté de core/ : pas d'import React/Next/DOM (règle CLAUDE.md vérifiée
  // habituellement par l'agent `architect-reviewer`).
  if (/from\s+['"]react['"]|from\s+['"]next\b/.test(patterns)) {
    errors.push(
      `${PATTERNS_PATH} ne doit pas importer React/Next — \`core/\` est pur (cf. CLAUDE.md).`,
    );
  }
}

// 3. Test co-localisé pour patterns (preuve d'usage du test-writer).
if (!existsSync(PATTERNS_TEST_PATH)) {
  errors.push(
    `Fichier introuvable : ${PATTERNS_TEST_PATH}. Test à écrire via l'agent \`test-writer\`.`,
  );
} else {
  const test = readFileSync(PATTERNS_TEST_PATH, 'utf-8');
  if (!/getPattern/.test(test)) {
    errors.push(`${PATTERNS_TEST_PATH} doit tester \`getPattern\`.`);
  }
  if (!/sut\b/.test(test)) {
    errors.push(
      `${PATTERNS_TEST_PATH} doit utiliser la convention \`sut\` (system under test) du skill \`vitest-test\`.`,
    );
  }
}

// 4. PatternSelector présent + typé + monté.
if (!existsSync(SELECTOR_PATH)) {
  errors.push(
    `Fichier introuvable : ${SELECTOR_PATH}. Composant à créer pour exposer le catalogue de patterns.`,
  );
} else {
  const selector = readFileSync(SELECTOR_PATH, 'utf-8');
  if (!/export\s+function\s+PatternSelector\b/.test(selector)) {
    errors.push(`${SELECTOR_PATH} doit exporter \`function PatternSelector\` (export nommé).`);
  }
  // Tolérance §3.2 : la bibliothèque RLE généralise les patterns en
  // strings nommées (au-delà du tuple fermé `PatternName`).
  if (!/value\s*:\s*(PatternName|string)\b/.test(selector)) {
    errors.push(`${SELECTOR_PATH} doit typer une prop \`value: PatternName\` (ou \`string\` à partir de §3.2).`);
  }
  if (!/onChange\s*:\s*\(/.test(selector)) {
    errors.push(`${SELECTOR_PATH} doit exposer un callback \`onChange\`.`);
  }
}

if (!existsSync(BOARD_PATH)) {
  errors.push(`Fichier introuvable : ${BOARD_PATH}.`);
} else {
  const board = readFileSync(BOARD_PATH, 'utf-8');
  // Tolérance forward-compat §3.1 : la gestion d'état (getPattern, reset)
  // peut être déléguée à un custom hook extrait (`use-simulator.ts`).
  // On agrège les sources pertinentes avant de chercher les preuves.
  const hookPath = 'src/components/use-simulator.ts';
  const hook = existsSync(hookPath) ? readFileSync(hookPath, 'utf-8') : '';
  const boardSurface = `${board}\n${hook}`;
  if (!/<PatternSelector\b/.test(board)) {
    errors.push(`${BOARD_PATH} doit monter \`<PatternSelector ... />\`.`);
  }
  // Tolérance §3.2 : `getPattern` peut être remplacé par
  // `getPatternLibraryEntry` (lookup typé sur la bibliothèque RLE).
  if (!/getPattern(LibraryEntry)?\b/.test(boardSurface)) {
    errors.push(
      `${BOARD_PATH} (ou son hook extrait) doit appeler \`getPattern\` (§2.8) ou \`getPatternLibraryEntry\` (§3.2) pour charger la grille depuis le catalogue.`,
    );
  }
  // Reset de la génération sur changement de pattern.
  // Tolérance §2.9 : soit `setGeneration(0)` direct, soit délégation à
  // `reset(...)` du simulator (état §2.9, qui resette `generation` à 0).
  // Tolérance §3.1 : la logique peut vivre dans `use-simulator.ts`.
  if (!/setGeneration\s*\(\s*0\s*\)|\breset\w*\s*\(/.test(boardSurface)) {
    errors.push(
      `${BOARD_PATH} (ou son hook extrait) doit remettre \`generation\` à 0 lorsque le pattern change (\`setGeneration(0)\` ou \`reset(...)\` du simulator §2.9).`,
    );
  }
}

if (errors.length === 0) {
  console.log('✅ check-2.8');
  console.log(
    '   ↳ Agents `code-reviewer`, `architect-reviewer`, `test-writer` présents au scope projet.',
  );
  console.log('   ↳ Frontmatter valide (name + description routable).');
  console.log('   ↳ `src/core/patterns.ts` : catalogue de seeds pur (4 patterns nommés).');
  console.log('   ↳ `PatternSelector` monté dans `Board`, génération resettée sur changement.');
  console.log('');
  console.log('💡 Concept §2.8 — un agent est un sous-contexte isolé déclenché par sa description');
  console.log('   (ou explicitement via `@nom`). Il rend un rapport, ne pollue pas le parent.');
  process.exit(0);
}

console.log('❌ check-2.8');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §2.8 mise en place (ou prompts/2.8.md en bouée).');
process.exit(1);
