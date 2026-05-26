// Check §2.9 — Custom slash commands (review + explain + refactor) + UI Canvas finale.
//
// Valide que :
//   - .claude/commands/{review,explain,refactor}.md existent ;
//   - chaque commande a un frontmatter `description` non-vide + un corps non-vide ;
//   - src/core/simulator.ts expose createSimulator + tick + setSpeed + setRunning + reset ;
//   - src/components/SimulatorControls.tsx existe avec les 4 contrôles + slider speed ;
//   - src/components/Board.tsx monte un <canvas> + <SimulatorControls /> + utilise tick.
//
// Les slash commands sont au scope projet (versionnées) — même nature que les agents
// §2.8, les skills §2.7 et les MCP §2.6, miroir inverse du plugin §2.5 (scope user).
//
// L'invocation effective d'une slash command par l'utilisateur (`/review` etc.) n'est
// pas vérifiable statiquement : on valide la présence et la structure. La preuve
// d'usage est l'artefact produit (UI canvas + boucle d'animation).

import { existsSync, readFileSync } from 'node:fs';

const REVIEW_CMD = '.claude/commands/review.md';
const EXPLAIN_CMD = '.claude/commands/explain.md';
const REFACTOR_CMD = '.claude/commands/refactor.md';
const SIMULATOR_PATH = 'src/core/simulator.ts';
const SIMULATOR_TEST_PATH = 'src/core/simulator.test.ts';
const CONTROLS_PATH = 'src/components/SimulatorControls.tsx';
const BOARD_PATH = 'src/components/Board.tsx';
const errors: string[] = [];

type Frontmatter = {
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

function checkCommand(path: string, label: string): void {
  if (!existsSync(path)) {
    errors.push(`Slash command introuvable : ${path}. Voir prompts/2.9.md.`);
    return;
  }
  const parsed = parseFrontmatter(readFileSync(path, 'utf-8'));
  if (!parsed) {
    errors.push(
      `${path} : frontmatter YAML absent ou malformé (attendu \`---\\ndescription: …\\n---\`).`,
    );
    return;
  }
  const { fm, body } = parsed;
  if (!fm.description || fm.description.length < 20) {
    errors.push(
      `${path} : frontmatter \`description\` absent ou trop court (< 20 caractères). C'est ce que Claude affiche dans l'autocomplétion \`/${label}\`.`,
    );
  }
  if (body.trim().length < 40) {
    errors.push(
      `${path} : corps de la commande vide ou trop court (< 40 caractères). Le corps est le prompt template envoyé à Claude — il doit cadrer la tâche.`,
    );
  }
}

// 1. Les 3 slash commands présentes + frontmatter + corps non-vide.
checkCommand(REVIEW_CMD, 'review');
checkCommand(EXPLAIN_CMD, 'explain');
checkCommand(REFACTOR_CMD, 'refactor');

// 2. Moteur de simulation pur dans core/ (testable).
if (!existsSync(SIMULATOR_PATH)) {
  errors.push(`Fichier introuvable : ${SIMULATOR_PATH}.`);
} else {
  const simulator = readFileSync(SIMULATOR_PATH, 'utf-8');
  const expected = ['createSimulator', 'tick', 'setSpeed', 'setRunning', 'reset'] as const;
  for (const name of expected) {
    const re = new RegExp(`export\\s+(function|const)\\s+${name}\\b`);
    if (!re.test(simulator)) {
      errors.push(`${SIMULATOR_PATH} doit exporter \`${name}\`.`);
    }
  }
  if (!/export\s+(interface|type)\s+SimulatorState\b/.test(simulator)) {
    errors.push(`${SIMULATOR_PATH} doit exporter le type \`SimulatorState\`.`);
  }
  // Pureté de core/ : pas d'import React/Next/DOM.
  if (/from\s+['"]react['"]|from\s+['"]next\b/.test(simulator)) {
    errors.push(
      `${SIMULATOR_PATH} ne doit pas importer React/Next — \`core/\` est pur (cf. CLAUDE.md).`,
    );
  }
}

// 3. Test sibling (le hook §2.4 le rend obligatoire, ceinture + bretelles).
if (!existsSync(SIMULATOR_TEST_PATH)) {
  errors.push(
    `Fichier introuvable : ${SIMULATOR_TEST_PATH}. Test à écrire AVANT le module (TDD, hook §2.4).`,
  );
}

// 4. SimulatorControls présent + props + slider speed.
if (!existsSync(CONTROLS_PATH)) {
  errors.push(
    `Fichier introuvable : ${CONTROLS_PATH}. Composant à créer pour exposer Play/Pause/Step/Reset/Speed.`,
  );
} else {
  const controls = readFileSync(CONTROLS_PATH, 'utf-8');
  if (!/export\s+function\s+SimulatorControls\b/.test(controls)) {
    errors.push(`${CONTROLS_PATH} doit exporter \`function SimulatorControls\` (export nommé).`);
  }
  for (const handler of ['onPlay', 'onPause', 'onStep', 'onReset', 'onSpeedChange'] as const) {
    const re = new RegExp(`${handler}\\s*:\\s*\\(`);
    if (!re.test(controls)) {
      errors.push(`${CONTROLS_PATH} doit exposer un callback \`${handler}\`.`);
    }
  }
  if (!/type\s*=\s*['"]range['"]/.test(controls)) {
    errors.push(
      `${CONTROLS_PATH} doit rendre un \`<input type="range">\` pour le réglage de vitesse.`,
    );
  }
}

// 5. Board monte canvas + SimulatorControls + utilise le simulator.
if (!existsSync(BOARD_PATH)) {
  errors.push(`Fichier introuvable : ${BOARD_PATH}.`);
} else {
  const board = readFileSync(BOARD_PATH, 'utf-8');
  if (!/<canvas\b/.test(board)) {
    errors.push(
      `${BOARD_PATH} doit rendre un \`<canvas>\` HTML5 à la place de l'ancienne grille DOM.`,
    );
  }
  if (!/<SimulatorControls\b/.test(board)) {
    errors.push(`${BOARD_PATH} doit monter \`<SimulatorControls ... />\`.`);
  }
  if (!/from\s+['"]@\/core\/simulator['"]/.test(board)) {
    errors.push(`${BOARD_PATH} doit importer le simulator depuis \`@/core/simulator\`.`);
  }
  if (!/useRef\s*</.test(board)) {
    errors.push(
      `${BOARD_PATH} doit utiliser \`useRef<HTMLCanvasElement>\` pour piloter le canvas.`,
    );
  }
  if (!/setInterval\s*\(/.test(board)) {
    errors.push(
      `${BOARD_PATH} doit démarrer une boucle d'animation (\`setInterval\`) quand \`isRunning\` est vrai.`,
    );
  }
}

if (errors.length === 0) {
  console.log('✅ check-2.9');
  console.log('   ↳ Slash commands `/review`, `/explain`, `/refactor` présentes au scope projet.');
  console.log('   ↳ Frontmatter `description` + corps non-vide pour chaque commande.');
  console.log(
    '   ↳ `src/core/simulator.ts` : moteur de boucle pur (5 fonctions + état immutable).',
  );
  console.log('   ↳ `SimulatorControls` monté dans `Board`, canvas HTML5 actif.');
  console.log('');
  console.log(
    "💡 Concept §2.9 — une slash command est un prompt versionné déclenché par l'utilisateur",
  );
  console.log('   (`/nom`). Templating : `$ARGUMENTS`, `@chemin`, `!shell`. Scope projet ou user.');
  process.exit(0);
}

console.log('❌ check-2.9');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §2.9 mise en place (ou prompts/2.9.md en bouée).');
process.exit(1);
