// Check §2.7 — Skills composables (next-component + vitest-test) + preuve d'usage.
//
// Valide que :
//   - .claude/skills/next-component/SKILL.md existe, frontmatter `name` + `description` non-vides ;
//   - .claude/skills/vitest-test/SKILL.md existe, frontmatter `name` + `description` non-vides ;
//   - composition : le corps de vitest-test/SKILL.md mentionne `next-component` ;
//   - preuve d'usage skill 1 : src/components/GenerationCounter.tsx existe, props typées,
//     monté dans src/components/Board.tsx ;
//   - preuve d'usage skill 2 : src/core/step.test.ts contient un test mentionnant `toad`.
//
// Les skills sont au scope projet (versionnés) — miroir inverse du plugin §2.5
// (scope user, hors repo) et de même nature que le MCP §2.6 (scope projet).
//
// Le déclenchement effectif d'un skill par Claude (description-based dispatch)
// n'est pas vérifiable statiquement : on valide la présence et la structure,
// pas l'invocation. La preuve d'usage est l'artefact produit.

import { existsSync, readFileSync } from 'node:fs';

const NEXT_COMPONENT_SKILL = '.claude/skills/next-component/SKILL.md';
const VITEST_TEST_SKILL = '.claude/skills/vitest-test/SKILL.md';
const COUNTER_PATH = 'src/components/GenerationCounter.tsx';
const BOARD_PATH = 'src/components/Board.tsx';
const STEP_TEST_PATH = 'src/core/step.test.ts';
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

function checkSkill(path: string, expectedName: string): { body: string } | null {
  if (!existsSync(path)) {
    errors.push(`Skill introuvable : ${path}. Voir prompts/2.7.md.`);
    return null;
  }
  const parsed = parseFrontmatter(readFileSync(path, 'utf-8'));
  if (!parsed) {
    errors.push(
      `${path} : frontmatter YAML absent ou malformé (attendu \`---\\nname: …\\ndescription: …\\n---\`).`,
    );
    return null;
  }
  const { fm, body } = parsed;
  if (!fm.name || fm.name.length === 0) {
    errors.push(`${path} : frontmatter \`name\` vide.`);
  } else if (fm.name !== expectedName) {
    errors.push(
      `${path} : frontmatter \`name\` doit valoir \`${expectedName}\` (vu : \`${fm.name}\`).`,
    );
  }
  if (!fm.description || fm.description.length < 20) {
    errors.push(
      `${path} : frontmatter \`description\` absent ou trop court (< 20 caractères). C'est ce que Claude lit pour décider de déclencher le skill.`,
    );
  }
  return { body };
}

// 1 & 2. Skills présents + frontmatter.
checkSkill(NEXT_COMPONENT_SKILL, 'next-component');
const vitest = checkSkill(VITEST_TEST_SKILL, 'vitest-test');

// 3. Composition : vitest-test référence next-component.
if (vitest && !/next-component/i.test(vitest.body)) {
  errors.push(
    `${VITEST_TEST_SKILL} : le corps doit mentionner \`next-component\` (composition skill — vitest-test s'appuie sur next-component pour les composants React).`,
  );
}

// 4. GenerationCounter présent + typé + monté.
if (!existsSync(COUNTER_PATH)) {
  errors.push(
    `Fichier introuvable : ${COUNTER_PATH}. Composant à scaffolder via le skill \`next-component\`.`,
  );
} else {
  const counter = readFileSync(COUNTER_PATH, 'utf-8');
  if (!/count\s*:\s*number/.test(counter)) {
    errors.push(`${COUNTER_PATH} doit typer une prop \`count: number\`.`);
  }
  if (!/export\s+function\s+GenerationCounter\b/.test(counter)) {
    errors.push(`${COUNTER_PATH} doit exporter \`function GenerationCounter\` (export nommé).`);
  }
}

if (!existsSync(BOARD_PATH)) {
  errors.push(`Fichier introuvable : ${BOARD_PATH}.`);
} else {
  const board = readFileSync(BOARD_PATH, 'utf-8');
  if (!/<GenerationCounter\b/.test(board)) {
    errors.push(
      `${BOARD_PATH} doit monter \`<GenerationCounter ... />\` (preuve d'usage du skill \`next-component\`).`,
    );
  }
}

// 5. Test toad dans step.test.ts.
if (!existsSync(STEP_TEST_PATH)) {
  errors.push(`Fichier introuvable : ${STEP_TEST_PATH}.`);
} else {
  const stepTest = readFileSync(STEP_TEST_PATH, 'utf-8');
  if (!/toad/i.test(stepTest)) {
    errors.push(
      `${STEP_TEST_PATH} doit contenir un test mentionnant \`toad\` (preuve d'usage du skill \`vitest-test\`).`,
    );
  }
}

if (errors.length === 0) {
  console.log('✅ check-2.7');
  console.log('   ↳ Skills `next-component` et `vitest-test` présents au scope projet.');
  console.log('   ↳ Composition : `vitest-test` référence `next-component`.');
  console.log('   ↳ <GenerationCounter /> monté dans <Board />.');
  console.log('   ↳ Test `toad` dans step.test.ts.');
  console.log('');
  console.log('💡 Concept §2.7 — un skill est auto-déclenché par sa description.');
  console.log('   Composable : un skill peut en référencer un autre (DRY + bundles cohérents).');
  process.exit(0);
}

console.log('❌ check-2.7');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §2.7 mise en place (ou prompts/2.7.md en bouée).');
process.exit(1);
