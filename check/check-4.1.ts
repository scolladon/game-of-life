// Check §4.1 — Engineering harness assemblé.
//
// Valide :
//   - 3 sous-agents qualité dans .claude/agents/ : quality-types, quality-lint,
//     quality-coverage. Chacun a un frontmatter `name` cohérent + `description`
//     non vide >= 30 chars + tools déclarés.
//   - Slash command .claude/commands/quality-gate.md présente avec frontmatter
//     `description` non vide + corps non vide qui mentionne les 3 sous-agents
//     (preuve d'orchestration).
//   - Workflow .github/workflows/ci.yml présent, déclenche sur push (main +
//     solution) et pull_request, et définit au moins les jobs : lint, test,
//     check, typecheck.
//   - Régression douce : les 3 agents de §2.8 (code-reviewer, architect-reviewer,
//     test-writer) sont toujours présents (le harness §4.1 s'ajoute, ne remplace
//     pas).
//
// Les sous-agents §4.1 sont objectifs (verdict binaire via outils tsc / biome /
// vitest), distincts des agents qualitatifs de §2.8 (jugement, sévérités).
// Le déclenchement effectif de `/quality-gate` n'est pas vérifiable statiquement
// (décision LLM) — on valide structure + cohérence des références.

import { existsSync, readFileSync } from 'node:fs';

const AGENT_TYPES = '.claude/agents/quality-types.md';
const AGENT_LINT = '.claude/agents/quality-lint.md';
const AGENT_COVERAGE = '.claude/agents/quality-coverage.md';
const AGENT_CODE_REVIEWER = '.claude/agents/code-reviewer.md';
const AGENT_ARCHITECT = '.claude/agents/architect-reviewer.md';
const AGENT_TEST_WRITER = '.claude/agents/test-writer.md';
const COMMAND_PATH = '.claude/commands/quality-gate.md';
const WORKFLOW_PATH = '.github/workflows/ci.yml';

const errors: string[] = [];

interface Frontmatter {
  readonly name?: string;
  readonly description?: string;
  readonly tools?: string;
  readonly 'allowed-tools'?: string;
}

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

function checkExists(path: string, hint: string): boolean {
  if (!existsSync(path)) {
    errors.push(`Fichier absent : ${path}. ${hint}`);
    return false;
  }
  return true;
}

function checkQualityAgent(path: string, expectedName: string): void {
  if (!checkExists(path, "Crée l'agent qualité §4.1 (voir prompts/4.1.md).")) return;
  const parsed = parseFrontmatter(readFileSync(path, 'utf-8'));
  if (!parsed) {
    errors.push(`${path} : frontmatter YAML absent ou malformé.`);
    return;
  }
  const { fm } = parsed;
  if (fm.name !== expectedName) {
    errors.push(
      `${path} : frontmatter \`name\` doit valoir \`${expectedName}\` (vu : \`${fm.name ?? '(absent)'}\`).`,
    );
  }
  if (!fm.description || fm.description.length < 30) {
    errors.push(
      `${path} : frontmatter \`description\` absent ou trop court (< 30 caractères). C'est ce que Claude lit pour décider de déléguer à l'agent.`,
    );
  }
  if (!fm.tools || fm.tools.length === 0) {
    errors.push(
      `${path} : frontmatter \`tools\` absent. Précise les outils nécessaires (au minimum \`Bash\` pour exécuter l'outil objectif).`,
    );
  } else if (!/\bBash\b/.test(fm.tools)) {
    errors.push(
      `${path} : frontmatter \`tools\` doit inclure \`Bash\` (l'agent exécute tsc / biome / vitest).`,
    );
  }
}

function checkRegressionAgent(path: string): void {
  if (!existsSync(path)) {
    errors.push(
      `Régression : agent §2.8 absent : ${path}. Le harness §4.1 s'ajoute, ne remplace pas §2.8.`,
    );
  }
}

function checkQualityGateCommand(): void {
  if (
    !checkExists(
      COMMAND_PATH,
      'Crée la slash command qui orchestre les 3 sous-agents qualité en parallèle.',
    )
  )
    return;
  const parsed = parseFrontmatter(readFileSync(COMMAND_PATH, 'utf-8'));
  if (!parsed) {
    errors.push(`${COMMAND_PATH} : frontmatter YAML absent ou malformé.`);
    return;
  }
  const { fm, body } = parsed;
  if (!fm.description || fm.description.length < 20) {
    errors.push(
      `${COMMAND_PATH} : frontmatter \`description\` absent ou trop court (< 20 caractères).`,
    );
  }
  if (body.trim().length < 100) {
    errors.push(
      `${COMMAND_PATH} : corps de la slash command vide ou quasi-vide (< 100 caractères). Décris l'orchestration.`,
    );
  }
  // Preuve d'orchestration : les 3 noms d'agents doivent apparaître dans le corps.
  const requiredMentions = ['quality-types', 'quality-lint', 'quality-coverage'];
  for (const name of requiredMentions) {
    if (!body.includes(name)) {
      errors.push(
        `${COMMAND_PATH} : le corps doit mentionner \`${name}\` (preuve d'orchestration des 3 sous-agents).`,
      );
    }
  }
}

function checkCiWorkflow(): void {
  if (!checkExists(WORKFLOW_PATH, 'Crée le workflow GitHub Actions miroir de `/quality-gate`.'))
    return;
  const content = readFileSync(WORKFLOW_PATH, 'utf-8');

  // Triggers : push (main + solution) + pull_request.
  if (!/^on\s*:/m.test(content)) {
    errors.push(`${WORKFLOW_PATH} : section \`on:\` absente (triggers du workflow).`);
  }
  if (!/\bpush\s*:/.test(content)) {
    errors.push(`${WORKFLOW_PATH} : trigger \`push:\` absent.`);
  }
  if (!/\bpull_request\s*:/.test(content)) {
    errors.push(`${WORKFLOW_PATH} : trigger \`pull_request:\` absent.`);
  }
  if (!/\bmain\b/.test(content)) {
    errors.push(`${WORKFLOW_PATH} : branche \`main\` non référencée dans les triggers.`);
  }
  if (!/\bsolution\b/.test(content)) {
    errors.push(
      `${WORKFLOW_PATH} : branche \`solution\` non référencée dans les triggers (push). Le formateur push sur \`solution\` aussi.`,
    );
  }

  // Jobs requis : lint, test, check, typecheck.
  const requiredJobs = ['lint', 'test', 'check', 'typecheck'];
  for (const job of requiredJobs) {
    // Job déclaré au début d'une ligne sous `jobs:` (`  <name>:` à 2 espaces d'indentation).
    const jobRegex = new RegExp(`^\\s{2}${job}\\s*:`, 'm');
    if (!jobRegex.test(content)) {
      errors.push(
        `${WORKFLOW_PATH} : job \`${job}\` absent. Attendu : 4 jobs (\`lint\`, \`test\`, \`check\`, \`typecheck\`).`,
      );
    }
  }

  // Cache npm.
  if (!/cache:\s*['"]?npm['"]?/.test(content)) {
    errors.push(
      `${WORKFLOW_PATH} : cache npm non activé sur \`actions/setup-node\`. Ajoute \`cache: 'npm'\` (perf + fiabilité).`,
    );
  }

  // Node 22.
  if (!/node-version:\s*['"]?22/.test(content)) {
    errors.push(
      `${WORKFLOW_PATH} : Node 22 attendu (\`node-version: '22'\`) — aligné sur le LTS courant et les conventions du projet.`,
    );
  }
}

// 1. Trois sous-agents qualité §4.1.
checkQualityAgent(AGENT_TYPES, 'quality-types');
checkQualityAgent(AGENT_LINT, 'quality-lint');
checkQualityAgent(AGENT_COVERAGE, 'quality-coverage');

// 2. Régression §2.8 — les 3 agents qualitatifs sont toujours là.
checkRegressionAgent(AGENT_CODE_REVIEWER);
checkRegressionAgent(AGENT_ARCHITECT);
checkRegressionAgent(AGENT_TEST_WRITER);

// 3. Slash command /quality-gate.
checkQualityGateCommand();

// 4. CI GitHub Actions miroir.
checkCiWorkflow();

if (errors.length === 0) {
  console.log('✅ check-4.1');
  console.log(
    '   ↳ 3 sous-agents qualité §4.1 (`quality-types`, `quality-lint`, `quality-coverage`) présents.',
  );
  console.log(
    '   ↳ Régression §2.8 OK : `code-reviewer`, `architect-reviewer`, `test-writer` toujours en place.',
  );
  console.log('   ↳ Slash command `/quality-gate` orchestre les 3 sous-agents (preuve textuelle).');
  console.log(
    '   ↳ CI GitHub Actions : triggers push (main + solution) + pull_request, jobs lint + test + check + typecheck (Node 22, cache npm).',
  );
  console.log('');
  console.log(
    '💡 Concept §4.1 — engineering harness : gates objectifs (verdict binaire) industrialisés via',
  );
  console.log(
    '   une slash command qui dispatche en parallèle, et une CI qui rejoue le même verdict côté',
  );
  console.log('   serveur. Distinct des agents §2.8 (jugement, sévérités).');
  process.exit(0);
}

console.log('❌ check-4.1');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §4.1 mise en place (ou prompts/4.1.md en bouée).');
process.exit(1);
