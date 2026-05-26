// Check §2.5 — Plugins (frontend-design + composant Board).
//
// Valide que :
//   - le marketplace `claude-plugins-official` est enregistré (~/.claude/plugins/known_marketplaces.json) ;
//   - le plugin `frontend-design@claude-plugins-official` est installé (~/.claude/plugins/installed_plugins.json) ;
//   - src/components/Board.tsx existe et exporte un composant `Board` ;
//   - src/app/page.tsx importe `Board` depuis @/components/Board.
//
// Particularité : ce check **sort du repo** pour lire ~/.claude/plugins/*.
// C'est délibéré — un plugin Claude Code s'installe au scope utilisateur
// (cf. anthropics/claude-code#62174), il n'est jamais versionné dans le repo.
// Conséquence : ce check est local-only (ne tournera pas en CI).

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const MARKETPLACES_PATH = join(homedir(), '.claude', 'plugins', 'known_marketplaces.json');
const INSTALLED_PATH = join(homedir(), '.claude', 'plugins', 'installed_plugins.json');
const BOARD_PATH = 'src/components/Board.tsx';
const PAGE_PATH = 'src/app/page.tsx';
const MARKETPLACE_NAME = 'claude-plugins-official';
const PLUGIN_KEY = 'frontend-design@claude-plugins-official';
const errors: string[] = [];

type InstalledPlugins = {
  version?: number;
  plugins?: Record<string, unknown>;
};

// 1. Marketplace enregistré.
if (!existsSync(MARKETPLACES_PATH)) {
  errors.push(
    `Fichier introuvable : ${MARKETPLACES_PATH}. Aucun marketplace Claude Code n'est enregistré sur ce poste.`,
  );
} else {
  try {
    const marketplaces = JSON.parse(readFileSync(MARKETPLACES_PATH, 'utf-8')) as Record<string, unknown>;
    if (!Object.hasOwn(marketplaces, MARKETPLACE_NAME)) {
      errors.push(
        `Marketplace \`${MARKETPLACE_NAME}\` absent de ${MARKETPLACES_PATH}. Lancez : /plugin marketplace add anthropics/claude-plugins-official`,
      );
    }
  } catch (e) {
    errors.push(`${MARKETPLACES_PATH} n'est pas du JSON valide : ${(e as Error).message}`);
  }
}

// 2. Plugin installé.
if (!existsSync(INSTALLED_PATH)) {
  errors.push(
    `Fichier introuvable : ${INSTALLED_PATH}. Aucun plugin n'est installé sur ce poste.`,
  );
} else {
  try {
    const installed = JSON.parse(readFileSync(INSTALLED_PATH, 'utf-8')) as InstalledPlugins;
    if (installed.version !== 2) {
      errors.push(
        `${INSTALLED_PATH} : schéma inattendu (version ${installed.version ?? 'absente'}, attendu 2). Le format du fichier a peut-être évolué côté Claude Code — vérifier la doc.`,
      );
    } else if (!installed.plugins || !Object.hasOwn(installed.plugins, PLUGIN_KEY)) {
      errors.push(
        `Plugin \`${PLUGIN_KEY}\` absent de ${INSTALLED_PATH}. Lancez : /plugin install frontend-design@claude-plugins-official`,
      );
    }
  } catch (e) {
    errors.push(`${INSTALLED_PATH} n'est pas du JSON valide : ${(e as Error).message}`);
  }
}

// 3. Board.tsx existe + exporte `Board`.
if (!existsSync(BOARD_PATH)) {
  errors.push(`Fichier introuvable : ${BOARD_PATH}. Demandez à Claude de créer le composant (cf. prompts/2.5.md).`);
} else {
  const board = readFileSync(BOARD_PATH, 'utf-8');
  if (!/export\s+(default\s+)?function\s+Board\b|export\s+\{[^}]*\bBoard\b[^}]*\}/.test(board)) {
    errors.push(`${BOARD_PATH} ne semble pas exporter un composant nommé \`Board\`.`);
  }
  if (!/from\s+['"]@\/core\/grid['"]|from\s+['"]\.\.\/core\/grid['"]/.test(board)) {
    errors.push(`${BOARD_PATH} doit consommer le moteur \`@/core/grid\` (type Grid).`);
  }
}

// 4. page.tsx importe Board.
if (!existsSync(PAGE_PATH)) {
  errors.push(`Fichier introuvable : ${PAGE_PATH}.`);
} else {
  const page = readFileSync(PAGE_PATH, 'utf-8');
  if (!/from\s+['"]@\/components\/Board['"]/.test(page)) {
    errors.push(`${PAGE_PATH} doit importer \`Board\` depuis \`@/components/Board\`.`);
  }
  if (!/<Board\b/.test(page)) {
    errors.push(`${PAGE_PATH} doit rendre \`<Board ... />\`.`);
  }
}

if (errors.length === 0) {
  console.log('✅ check-2.5');
  console.log(`   ↳ Marketplace \`${MARKETPLACE_NAME}\` enregistré (scope user).`);
  console.log(`   ↳ Plugin \`${PLUGIN_KEY}\` installé (scope user).`);
  console.log('   ↳ Composant Board.tsx présent + intégré dans app/page.tsx.');
  console.log('');
  console.log('💡 Concept §2.5 — un plugin vit hors du repo (productivité personnelle).');
  console.log('   Ce check sort volontairement du repo pour le matérialiser.');
  process.exit(0);
}

console.log('❌ check-2.5');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §2.5 mise en place (ou prompts/2.5.md en bouée).');
process.exit(1);
