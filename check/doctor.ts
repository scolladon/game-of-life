/**
 * Vérifie que l'environnement local est prêt pour la formation.
 * Utilisé par `npm run doctor` — à lancer avant J1.
 */

import { execFileSync } from 'node:child_process';

type Check = { name: string; cmd: string; args: string[]; minVersion?: string };

const checks: Check[] = [
  { name: 'Node.js', cmd: 'node', args: ['--version'] },
  { name: 'npm', cmd: 'npm', args: ['--version'] },
  { name: 'git', cmd: 'git', args: ['--version'] },
  { name: 'Claude Code CLI', cmd: 'claude', args: ['--version'] },
];

let ok = true;

for (const c of checks) {
  try {
    const version = execFileSync(c.cmd, c.args, { stdio: 'pipe' }).toString().trim();
    console.log(`✅ ${c.name}: ${version}`);
  } catch {
    console.log(`❌ ${c.name}: introuvable dans le PATH`);
    ok = false;
  }
}

if (!ok) {
  console.log('\nVérifiez les installations manquantes avant J1.');
  process.exit(1);
}

console.log('\nEnvironnement OK — prêt pour la formation.');
process.exit(0);
