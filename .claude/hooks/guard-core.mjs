#!/usr/bin/env node
// PreToolUse hook §2.4 — défend la règle dure « src/core/ doit rester pur ET testé »
// posée dans CLAUDE.md §Architecture. Bloque toute édition d'un fichier
// src/core/<nom>.ts(x) sans sibling <nom>.test.ts(x) co-localisé.
//
// Stdin  : JSON { tool_name, tool_input: { file_path, ... }, ... }
// Stdout : rien (cas autorisé) ou JSON { hookSpecificOutput: { permissionDecision: 'deny', ... } }
// Exit   : 0 dans tous les cas (la décision passe par le JSON, pas par le code de sortie).

import { existsSync } from 'node:fs';
import { dirname, basename, join } from 'node:path';

const readStdin = () =>
  new Promise((resolve) => {
    let raw = '';
    process.stdin.on('data', (chunk) => {
      raw += chunk;
    });
    process.stdin.on('end', () => resolve(raw));
  });

const deny = (reason) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
};

const raw = await readStdin();
let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path;
if (typeof filePath !== 'string' || filePath.length === 0) {
  process.exit(0);
}

const CORE_PATTERN = /(^|\/)src\/core\/[^/]+\.tsx?$/;
const TEST_PATTERN = /\.test\.tsx?$/;

if (!CORE_PATTERN.test(filePath) || TEST_PATTERN.test(filePath)) {
  process.exit(0);
}

const dir = dirname(filePath);
const base = basename(filePath).replace(/\.tsx?$/, '');
const siblingTs = join(dir, `${base}.test.ts`);
const siblingTsx = join(dir, `${base}.test.tsx`);

if (existsSync(siblingTs) || existsSync(siblingTsx)) {
  process.exit(0);
}

deny(
  `core/ exige un test co-localisé (cf. CLAUDE.md §Architecture). Crée ${dir}/${base}.test.ts d'abord.`,
);
