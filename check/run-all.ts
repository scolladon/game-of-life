/**
 * Lance tous les checks de la formation en séquence et imprime un récap final.
 * Utilisé par `npm run check`.
 *
 * Chaque check `check-X.Y.ts` est un script TypeScript autonome qui valide :
 *  1. Le concept Claude Code appliqué à cette étape (fichiers de config présents et corrects).
 *  2. Les AC de la feature Game of Life livrée à cette étape.
 *
 * Exit 0 si tous les checks passent, 1 sinon.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CHECK_DIR = new URL('.', import.meta.url).pathname;

type Result = { id: string; ok: boolean; output: string };

const stepIds = readdirSync(CHECK_DIR)
  .filter((file) => /^check-\d+\.\d+\.ts$/.test(file))
  .map((file) => file.replace(/^check-/, '').replace(/\.ts$/, ''))
  .sort((a, b) => {
    const [aMajor, aMinor] = a.split('.').map(Number);
    const [bMajor, bMinor] = b.split('.').map(Number);
    return aMajor !== bMajor ? aMajor - bMajor : aMinor - bMinor;
  });

const results: Result[] = [];

for (const id of stepIds) {
  const script = join(CHECK_DIR, `check-${id}.ts`);
  if (!existsSync(script)) {
    results.push({ id, ok: false, output: `script manquant: ${script}` });
    continue;
  }
  try {
    const output = execFileSync('npx', ['tsx', script], { stdio: 'pipe' }).toString();
    results.push({ id, ok: true, output });
  } catch (err) {
    const error = err as { stdout?: Buffer; stderr?: Buffer };
    const output = `${error.stdout?.toString() ?? ''}${error.stderr?.toString() ?? ''}`;
    results.push({ id, ok: false, output });
  }
}

console.log('\n=== Récap final ===\n');
for (const { id, ok, output } of results) {
  if (ok) {
    console.log(`✅ check-${id}`);
  } else {
    console.log(`❌ check-${id}`);
    for (const line of output.split('\n').filter(Boolean)) {
      console.log(`   ${line}`);
    }
  }
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\n${passed} / ${total} checks passent.`);

process.exit(passed === total ? 0 : 1);
