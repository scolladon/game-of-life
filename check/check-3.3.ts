// Check §3.3 — Workflow IA (PRD/Design/Plan/Implement) appliqué à
// la feature "HighLife + persistance Drizzle".
//
// Valide :
//   - Règle HighLife (B36/S23) présente dans src/core/rules.ts.
//   - `step` accepte un argument `rule` (signature étendue, backward-compat).
//   - Composant RuleSelector présent dans l'UI.
//   - Schéma Drizzle (table game_states) + colonnes requises.
//   - Repository : exporte saveState + loadLatestState (signatures async).
//   - Route API src/app/api/state/route.ts exporte POST et GET.

import { existsSync, readFileSync } from 'node:fs';

const RULES_PATH = 'src/core/rules.ts';
const RULES_TEST_PATH = 'src/core/rules.test.ts';
const STEP_PATH = 'src/core/step.ts';
const SELECTOR_PATH = 'src/components/RuleSelector.tsx';
const BOARD_PATH = 'src/components/Board.tsx';
const SCHEMA_PATH = 'src/lib/persistence/schema.ts';
const REPO_PATH = 'src/lib/persistence/repository.ts';
const REPO_TEST_PATH = 'src/lib/persistence/repository.test.ts';
const ROUTE_PATH = 'src/app/api/state/route.ts';

const errors: string[] = [];

function checkFile(path: string, hint: string): boolean {
  if (!existsSync(path)) {
    errors.push(`Fichier absent : ${path}. ${hint}`);
    return false;
  }
  return true;
}

interface RuleShape {
  readonly name: string;
  readonly birth: readonly number[];
  readonly survive: readonly number[];
}

interface RulesModule {
  readonly CONWAY: RuleShape;
  readonly HIGHLIFE: RuleShape;
  readonly RULES: readonly RuleShape[];
  readonly getRule: (name: string) => RuleShape;
}

async function checkRulesModule(): Promise<void> {
  if (!checkFile(RULES_PATH, 'Crée src/core/rules.ts avec CONWAY, HIGHLIFE, RULES et getRule.'))
    return;
  if (!checkFile(RULES_TEST_PATH, 'Test sibling obligatoire pour rules.ts (cf. garde §2.4).'))
    return;

  try {
    const url = new URL(`../${RULES_PATH}`, import.meta.url).href;
    const mod = (await import(url)) as RulesModule;
    if (!mod.CONWAY || mod.CONWAY.name !== 'conway') {
      errors.push(`${RULES_PATH} doit exporter CONWAY (name === "conway").`);
    } else {
      const okBirth = mod.CONWAY.birth.length === 1 && mod.CONWAY.birth.includes(3);
      const okSurvive =
        mod.CONWAY.survive.length === 2 &&
        mod.CONWAY.survive.includes(2) &&
        mod.CONWAY.survive.includes(3);
      if (!okBirth || !okSurvive) {
        errors.push(`${RULES_PATH} : CONWAY doit être B3/S23 (birth=[3], survive=[2,3]).`);
      }
    }
    if (!mod.HIGHLIFE || mod.HIGHLIFE.name !== 'highlife') {
      errors.push(`${RULES_PATH} doit exporter HIGHLIFE (name === "highlife").`);
    } else {
      const okBirth =
        mod.HIGHLIFE.birth.length === 2 &&
        mod.HIGHLIFE.birth.includes(3) &&
        mod.HIGHLIFE.birth.includes(6);
      const okSurvive =
        mod.HIGHLIFE.survive.length === 2 &&
        mod.HIGHLIFE.survive.includes(2) &&
        mod.HIGHLIFE.survive.includes(3);
      if (!okBirth || !okSurvive) {
        errors.push(`${RULES_PATH} : HIGHLIFE doit être B36/S23 (birth=[3,6], survive=[2,3]).`);
      }
    }
    if (typeof mod.getRule !== 'function') {
      errors.push(`${RULES_PATH} doit exporter \`function getRule(name)\`.`);
    } else if (mod.getRule('highlife')?.name !== 'highlife') {
      errors.push(`${RULES_PATH} : getRule("highlife") doit retourner la règle HIGHLIFE.`);
    }
  } catch (err) {
    errors.push(`${RULES_PATH} : import dynamique a échoué — ${(err as Error).message}.`);
  }
}

function checkStepSignature(): void {
  if (!checkFile(STEP_PATH, 'src/core/step.ts doit accepter un argument optionnel `rule`.')) return;
  const content = readFileSync(STEP_PATH, 'utf-8');
  if (!/export\s+function\s+step\s*\([^)]*rule[^)]*\)/.test(content)) {
    errors.push(
      `${STEP_PATH} : la signature \`step\` doit accepter un argument \`rule\` (ex: \`step(grid, rule = CONWAY)\`).`,
    );
  }
  if (!/Rule/.test(content)) {
    errors.push(`${STEP_PATH} : doit importer/référencer le type \`Rule\` (depuis ./rules).`);
  }
}

function checkRuleSelector(): void {
  if (!checkFile(SELECTOR_PATH, 'Crée src/components/RuleSelector.tsx (dropdown des règles).'))
    return;
  const content = readFileSync(SELECTOR_PATH, 'utf-8');
  if (!/from\s+['"]@\/core\/rules['"]/.test(content)) {
    errors.push(`${SELECTOR_PATH} doit importer depuis \`@/core/rules\`.`);
  }
  if (!/<select\b/.test(content)) {
    errors.push(`${SELECTOR_PATH} doit utiliser un \`<select>\` (UI de sélection des règles).`);
  }

  if (!checkFile(BOARD_PATH, 'Board.tsx doit monter le RuleSelector.')) return;
  const board = readFileSync(BOARD_PATH, 'utf-8');
  if (!/<RuleSelector\b/.test(board)) {
    errors.push(
      `${BOARD_PATH} : doit monter \`<RuleSelector ... />\` (sélecteur de règles câblé).`,
    );
  }
}

function checkSchema(): void {
  if (!checkFile(SCHEMA_PATH, 'Crée le schéma Drizzle src/lib/persistence/schema.ts.')) return;
  const content = readFileSync(SCHEMA_PATH, 'utf-8');
  if (!/sqliteTable\s*\(\s*['"]game_states['"]/.test(content)) {
    errors.push(`${SCHEMA_PATH} : doit déclarer une table \`game_states\` via \`sqliteTable\`.`);
  }
  const REQUIRED_COLUMNS = ['pattern_name', 'generation', 'rule_name', 'grid_json', 'created_at'];
  for (const column of REQUIRED_COLUMNS) {
    if (!content.includes(`'${column}'`) && !content.includes(`"${column}"`)) {
      errors.push(`${SCHEMA_PATH} : colonne \`${column}\` manquante dans la table game_states.`);
    }
  }
}

function checkRepository(): void {
  if (
    !checkFile(REPO_PATH, 'Crée src/lib/persistence/repository.ts (saveState + loadLatestState).')
  )
    return;
  if (!checkFile(REPO_TEST_PATH, 'Test sibling obligatoire pour repository.ts.')) return;
  const content = readFileSync(REPO_PATH, 'utf-8');
  if (!/export\s+async\s+function\s+saveState\b/.test(content)) {
    errors.push(`${REPO_PATH} : doit exporter \`export async function saveState\`.`);
  }
  if (!/export\s+async\s+function\s+loadLatestState\b/.test(content)) {
    errors.push(`${REPO_PATH} : doit exporter \`export async function loadLatestState\`.`);
  }
}

function checkRoute(): void {
  if (!checkFile(ROUTE_PATH, 'Crée la route API Next src/app/api/state/route.ts (POST + GET).'))
    return;
  const content = readFileSync(ROUTE_PATH, 'utf-8');
  if (!/export\s+(async\s+)?function\s+POST\b/.test(content)) {
    errors.push(`${ROUTE_PATH} : doit exporter \`POST\` (sauvegarde un snapshot).`);
  }
  if (!/export\s+(async\s+)?function\s+GET\b/.test(content)) {
    errors.push(`${ROUTE_PATH} : doit exporter \`GET\` (charge le dernier snapshot).`);
  }
}

async function main(): Promise<void> {
  await checkRulesModule();
  checkStepSignature();
  checkRuleSelector();
  checkSchema();
  checkRepository();
  checkRoute();

  if (errors.length === 0) {
    console.log('✅ check-3.3');
    console.log(`   ↳ Règles CONWAY + HIGHLIFE (B36/S23) présentes (${RULES_PATH}).`);
    console.log(`   ↳ \`step(grid, rule?)\` étendu (backward-compat Conway).`);
    console.log(`   ↳ RuleSelector monté dans Board.tsx.`);
    console.log(`   ↳ Schéma Drizzle table \`game_states\` (5 colonnes requises).`);
    console.log(`   ↳ Repository : saveState + loadLatestState (async) + test sibling.`);
    console.log(`   ↳ Route API ${ROUTE_PATH} (POST + GET).`);
    console.log('');
    console.log('💡 Concept §3.3 — workflow IA : PRD → Design → Plan → Implement, chaque');
    console.log('   phase validée par une review. Discipline qui empêche la dérive sur');
    console.log("   les features non-triviales — c'est ce qu'on applique pour construire");
    console.log('   ce projet de formation depuis §1.1 (méta-cohérence).');
    process.exit(0);
  }

  console.log('❌ check-3.3');
  for (const err of errors) {
    console.log(`   ↳ ${err}`);
  }
  console.log('   ↳ Hint : voir slide §3.3 mise en place (ou prompts/3.3.md en bouée).');
  process.exit(1);
}

main().catch((err: unknown) => {
  console.log('❌ check-3.3');
  console.log(`   ↳ Erreur inattendue : ${(err as Error).message}`);
  process.exit(1);
});
