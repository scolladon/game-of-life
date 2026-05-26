// Check §3.1 — Optimisation de la consommation de tokens.
//
// Valide qu'une session "optim tokens" a été conduite sur le refactor d'un
// module (suggéré : Board.tsx), avec :
//   - une trace observable de la session dans docs/refactors/3.1-compact-session.md
//     (mention explicite de /compact pour matérialiser la mécanique enseignée) ;
//   - l'extraction effective des responsabilités du module cible :
//       * src/components/Board.draw.ts (drawing canvas pur)
//       * src/components/use-simulator.ts (custom hook d'état)
//   - un test sibling sur le module pur extrait (sinon on ne couvre pas le code
//     déplacé — régression-guard du hook §2.4) ;
//   - Board.tsx réduit à la composition (< 70 lignes — borne souple, le but
//     est de matérialiser l'allègement, pas de chasser le caractère).
//
// L'invocation effective de /compact pendant la session n'est pas vérifiable
// statiquement (c'est un événement TUI). On valide la TRACE : le participant
// écrit ce qu'il a compacté, quand, et pourquoi — c'est le livrable
// pédagogique observable de §3.1.

import { existsSync, readFileSync, statSync } from 'node:fs';

const TRACE_PATH = 'docs/refactors/3.1-compact-session.md';
const DRAW_PATH = 'src/components/Board.draw.ts';
const DRAW_TEST_PATH = 'src/components/Board.draw.test.ts';
const HOOK_PATH = 'src/components/use-simulator.ts';
const BOARD_PATH = 'src/components/Board.tsx';
const BOARD_MAX_LINES = 70;
const TRACE_MIN_BYTES = 400;

const errors: string[] = [];

function checkTrace(): void {
  if (!existsSync(TRACE_PATH)) {
    errors.push(
      `Trace introuvable : ${TRACE_PATH}. Crée un document qui décrit la session avec /compact (avant/après, ce qui a été compacté, pourquoi).`,
    );
    return;
  }
  const size = statSync(TRACE_PATH).size;
  if (size < TRACE_MIN_BYTES) {
    errors.push(
      `${TRACE_PATH} : trace trop courte (${size} octets, attendu ≥ ${TRACE_MIN_BYTES}). Le but est de documenter la conduite de session (avant/après + quand /compact a été déclenché).`,
    );
    return;
  }
  const content = readFileSync(TRACE_PATH, 'utf-8');
  if (!/\/compact/i.test(content)) {
    errors.push(
      `${TRACE_PATH} : mention de \`/compact\` absente. La trace doit nommer la mécanique enseignée (sinon ce n'est pas observable).`,
    );
  }
  if (!/(avant|before)/i.test(content) || !/(après|after)/i.test(content)) {
    errors.push(
      `${TRACE_PATH} : la trace doit comparer un avant/après (responsabilités, lignes, fichiers).`,
    );
  }
}

function checkExtract(path: string, label: string, hint: string): void {
  if (!existsSync(path)) {
    errors.push(`Module extrait absent : ${path}. ${hint}`);
    return;
  }
  const content = readFileSync(path, 'utf-8');
  if (content.trim().length < 50) {
    errors.push(`${path} : ${label} trop court (< 50 caractères de contenu utile).`);
  }
}

function checkBoardSlim(): void {
  if (!existsSync(BOARD_PATH)) {
    errors.push(`Fichier introuvable : ${BOARD_PATH}.`);
    return;
  }
  const content = readFileSync(BOARD_PATH, 'utf-8');
  const lines = content.split('\n').length;
  if (lines >= BOARD_MAX_LINES) {
    errors.push(
      `${BOARD_PATH} : ${lines} lignes — attendu < ${BOARD_MAX_LINES}. Après refactor, Board.tsx doit ne porter QUE la composition (hook + JSX), pas le drawing ni la gestion d'état.`,
    );
  }
  if (!/from\s+['"]\.\/Board\.draw['"]/.test(content)) {
    errors.push(
      `${BOARD_PATH} doit importer \`drawGrid\` depuis \`./Board.draw\` (preuve que l'extraction du drawing est effective).`,
    );
  }
  if (!/from\s+['"]\.\/use-simulator['"]/.test(content)) {
    errors.push(
      `${BOARD_PATH} doit importer \`useSimulator\` depuis \`./use-simulator\` (preuve que l'extraction du hook est effective).`,
    );
  }
}

function checkDrawIsPure(): void {
  if (!existsSync(DRAW_PATH)) return;
  const content = readFileSync(DRAW_PATH, 'utf-8');
  if (/from\s+['"]react['"]/.test(content)) {
    errors.push(
      `${DRAW_PATH} ne doit pas importer React — c'est un module de drawing pur, séparé pour être testable sans renderer.`,
    );
  }
  if (!/export\s+function\s+drawGrid\b/.test(content)) {
    errors.push(`${DRAW_PATH} doit exporter \`function drawGrid\`.`);
  }
}

function checkHookSignature(): void {
  if (!existsSync(HOOK_PATH)) return;
  const content = readFileSync(HOOK_PATH, 'utf-8');
  if (!/^['"]use client['"]/m.test(content)) {
    errors.push(`${HOOK_PATH} doit déclarer \`'use client'\` (custom hook React).`);
  }
  if (!/export\s+function\s+useSimulator\b/.test(content)) {
    errors.push(`${HOOK_PATH} doit exporter \`function useSimulator\` (custom hook).`);
  }
}

checkTrace();
checkExtract(
  DRAW_PATH,
  'Board.draw.ts (drawing canvas extrait)',
  'Extrais le rendu canvas hors de Board.tsx (drawGrid + constantes CELL_SIZE/ALIVE_COLOR/...).',
);
checkExtract(
  DRAW_TEST_PATH,
  'Board.draw.test.ts (sibling test)',
  'Tout module pur extrait DOIT avoir son test sibling — cohérent avec la garde §2.4.',
);
checkExtract(
  HOOK_PATH,
  'use-simulator.ts (custom hook)',
  "Extrais la gestion d'état (useState + useEffect boucle + useCallback) dans un custom hook.",
);
checkDrawIsPure();
checkHookSignature();
checkBoardSlim();

if (errors.length === 0) {
  console.log('✅ check-3.1');
  console.log(`   ↳ Trace observable présente : ${TRACE_PATH}.`);
  console.log(`   ↳ Board.tsx allégé à la composition pure (< ${BOARD_MAX_LINES} lignes).`);
  console.log('   ↳ Drawing canvas extrait dans Board.draw.ts (pur, sans React).');
  console.log('   ↳ Custom hook useSimulator extrait dans use-simulator.ts.');
  console.log('   ↳ Test sibling sur le module pur (Board.draw.test.ts).');
  console.log('');
  console.log("💡 Concept §3.1 — `/compact` résume l'historique pour libérer du contexte ;");
  console.log('   `/clear` reset tout ; sub-agents isolent le bruit (recherche, audit) ;');
  console.log("   lecture ciblée + Plan Mode + modèle d'effort complètent la discipline.");
  process.exit(0);
}

console.log('❌ check-3.1');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §3.1 mise en place (ou prompts/3.1.md en bouée).');
process.exit(1);
