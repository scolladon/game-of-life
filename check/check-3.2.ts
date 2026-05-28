// Check §3.2 — LSP (Serena MCP) + bibliothèque de patterns RLE.
//
// Valide :
//   - Parser RLE présent + testé (src/core/rle.ts + sibling test).
//   - Bibliothèque de patterns enrichie (src/core/pattern-library.ts + sibling test).
//     - ≥ 8 patterns, ≥ 4 catégories distinctes, patterns canoniques présents.
//     - parsing fonctionnel (glider RLE → grille correcte).
//   - PatternSelector.tsx consomme la bibliothèque enrichie (groupement par catégorie).
//   - Couverture 100 % sur src/core/ (vitest --coverage + coverage-summary.json).
//
// L'utilisation effective de Serena pendant la session n'est pas vérifiable
// statiquement (c'est un événement MCP). On valide les LIVRABLES de la séance.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const RLE_PATH = 'src/core/rle.ts';
const RLE_TEST_PATH = 'src/core/rle.test.ts';
const LIB_PATH = 'src/core/pattern-library.ts';
const LIB_TEST_PATH = 'src/core/pattern-library.test.ts';
const SELECTOR_PATH = 'src/components/PatternSelector.tsx';
const COVERAGE_PATH = 'coverage/coverage-summary.json';

const REQUIRED_PATTERNS = [
  'glider',
  'blinker',
  'toad',
  'beacon',
  'pulsar',
  'gosper-glider-gun',
  'lwss',
  'r-pentomino',
] as const;

const REQUIRED_CATEGORIES = ['still-life', 'oscillator', 'spaceship', 'gun'] as const;

const errors: string[] = [];

function checkFile(path: string, hint: string): boolean {
  if (!existsSync(path)) {
    errors.push(`Fichier absent : ${path}. ${hint}`);
    return false;
  }
  return true;
}

interface ParseRleModule {
  readonly parseRle: (input: string) => readonly (readonly boolean[])[];
}

interface PatternLibraryEntry {
  readonly name: string;
  readonly displayName: string;
  readonly category: string;
  readonly grid: readonly (readonly boolean[])[];
}

interface PatternLibraryModule {
  readonly getPatternLibrary: () => readonly PatternLibraryEntry[];
}

async function checkRleParser(): Promise<void> {
  if (!checkFile(RLE_PATH, 'Crée le parser RLE (parseRle: string → Grid).')) return;
  if (
    !checkFile(RLE_TEST_PATH, 'Tout module de core/ DOIT avoir son test sibling (cf. garde §2.4).')
  )
    return;

  try {
    const url = new URL(`../${RLE_PATH}`, import.meta.url).href;
    const mod = (await import(url)) as ParseRleModule;
    if (typeof mod.parseRle !== 'function') {
      errors.push(`${RLE_PATH} doit exporter \`function parseRle\`.`);
      return;
    }
    // Glider canonique — vérification d'intégration.
    const glider = mod.parseRle('x = 3, y = 3\nbob$2bo$3o!');
    if (glider.length !== 3 || glider[0].length !== 3) {
      errors.push(
        `${RLE_PATH} : parseRle("glider") doit retourner une grille 3×3 (reçu ${glider.length}×${glider[0]?.length ?? '?'}).`,
      );
      return;
    }
    const alive = glider.flat().filter((c) => c).length;
    if (alive !== 5) {
      errors.push(`${RLE_PATH} : le glider canonique a 5 cellules vivantes (reçu ${alive}).`);
    }
  } catch (err) {
    errors.push(`${RLE_PATH} : import dynamique a échoué — ${(err as Error).message}.`);
  }
}

async function checkPatternLibrary(): Promise<void> {
  if (
    !checkFile(LIB_PATH, 'Crée la bibliothèque (getPatternLibrary: () => PatternLibraryEntry[]).')
  )
    return;
  if (!checkFile(LIB_TEST_PATH, 'Test sibling obligatoire pour pattern-library.ts.')) return;

  try {
    const url = new URL(`../${LIB_PATH}`, import.meta.url).href;
    const mod = (await import(url)) as PatternLibraryModule;
    if (typeof mod.getPatternLibrary !== 'function') {
      errors.push(`${LIB_PATH} doit exporter \`function getPatternLibrary\`.`);
      return;
    }
    const lib = mod.getPatternLibrary();
    if (lib.length < 8) {
      errors.push(`${LIB_PATH} : bibliothèque insuffisante (${lib.length} patterns, attendu ≥ 8).`);
    }
    const names = new Set(lib.map((entry) => entry.name));
    for (const required of REQUIRED_PATTERNS) {
      if (!names.has(required)) {
        errors.push(`${LIB_PATH} : pattern canonique manquant — "${required}".`);
      }
    }
    const categories = new Set(lib.map((entry) => entry.category));
    for (const required of REQUIRED_CATEGORIES) {
      if (!categories.has(required)) {
        errors.push(`${LIB_PATH} : catégorie manquante — "${required}".`);
      }
    }
    for (const entry of lib) {
      if (!entry.displayName || entry.displayName.length === 0) {
        errors.push(`${LIB_PATH} : entry "${entry.name}" sans displayName.`);
      }
      if (entry.grid.length === 0 || entry.grid[0].length === 0) {
        errors.push(`${LIB_PATH} : entry "${entry.name}" a une grille vide.`);
      }
    }
  } catch (err) {
    errors.push(`${LIB_PATH} : import dynamique a échoué — ${(err as Error).message}.`);
  }
}

function checkPatternSelector(): void {
  if (
    !checkFile(
      SELECTOR_PATH,
      'Le composant PatternSelector doit consommer la bibliothèque enrichie.',
    )
  )
    return;
  const content = readFileSync(SELECTOR_PATH, 'utf-8');
  if (!/from\s+['"]@\/core\/pattern-library['"]/.test(content)) {
    errors.push(
      `${SELECTOR_PATH} doit importer depuis \`@/core/pattern-library\` (la bibliothèque enrichie de §3.2).`,
    );
  }
  if (!/<optgroup\b/.test(content)) {
    errors.push(`${SELECTOR_PATH} doit grouper les patterns par catégorie via \`<optgroup>\`.`);
  }
}

function checkCoverage(): void {
  try {
    execFileSync('npx', ['vitest', 'run', '--coverage', '--silent'], {
      stdio: 'pipe',
    });
  } catch (err) {
    const error = err as { stdout?: Buffer; stderr?: Buffer };
    const output = `${error.stdout?.toString() ?? ''}${error.stderr?.toString() ?? ''}`;
    errors.push(`Échec de \`vitest run --coverage\` : ${output.slice(0, 400)}`);
    return;
  }
  if (!existsSync(COVERAGE_PATH)) {
    errors.push(
      `Couverture introuvable : ${COVERAGE_PATH} (lancer \`npm run test -- --coverage\`).`,
    );
    return;
  }
  interface CoverageSummary {
    readonly total: {
      readonly statements: { readonly pct: number };
      readonly branches: { readonly pct: number };
      readonly functions: { readonly pct: number };
      readonly lines: { readonly pct: number };
    };
  }
  const raw = readFileSync(COVERAGE_PATH, 'utf-8');
  const summary = JSON.parse(raw) as CoverageSummary;
  const t = summary.total;
  if (
    t.statements.pct < 100 ||
    t.branches.pct < 100 ||
    t.functions.pct < 100 ||
    t.lines.pct < 100
  ) {
    errors.push(
      `Couverture src/core/ < 100 % (statements ${t.statements.pct}%, branches ${t.branches.pct}%, functions ${t.functions.pct}%, lines ${t.lines.pct}%). Complète les tests jusqu'à 100 %.`,
    );
  }
}

async function main(): Promise<void> {
  await checkRleParser();
  await checkPatternLibrary();
  checkPatternSelector();
  checkCoverage();

  if (errors.length === 0) {
    console.log('✅ check-3.2');
    console.log(`   ↳ Parser RLE présent (${RLE_PATH}) + test sibling.`);
    console.log(
      `   ↳ Bibliothèque enrichie (${REQUIRED_PATTERNS.length}+ patterns, ${REQUIRED_CATEGORIES.length} catégories).`,
    );
    console.log(`   ↳ PatternSelector consomme \`getPatternLibrary()\` groupé par catégorie.`);
    console.log('   ↳ Couverture src/core/ = 100 % (statements / branches / functions / lines).');
    console.log('');
    console.log('💡 Concept §3.2 — Serena MCP expose un langserver au LLM : navigation');
    console.log('   et édition par SYMBOLE (find_symbol, replace_symbol_body, rename_symbol)');
    console.log('   plutôt que par regex. Gain de précision sur les refactors cross-fichiers,');
    console.log('   gain de tokens vs lecture intégrale des fichiers.');
    process.exit(0);
  }

  console.log('❌ check-3.2');
  for (const err of errors) {
    console.log(`   ↳ ${err}`);
  }
  console.log('   ↳ Hint : voir slide §3.2 mise en place (ou prompts/3.2.md en bouée).');
  process.exit(1);
}

main().catch((err: unknown) => {
  console.log('❌ check-3.2');
  console.log(`   ↳ Erreur inattendue : ${(err as Error).message}`);
  process.exit(1);
});
