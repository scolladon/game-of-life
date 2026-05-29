// Check §2.6 — MCP public (Context7) + bouton Next.
//
// Valide que :
//   - .mcp.json à la racine du repo déclare un serveur Context7 (stdio) ;
//   - src/components/Board.tsx est un *client component* (`'use client'` en première
//     ligne non-vide) qui expose un bouton « Next » dont le handler appelle `step(`
//     pour faire avancer la grille ;
//   - src/app/page.tsx passe `initialGrid={...}` à <Board /> (server component qui
//     pousse le seed initial au composant client).
//
// Contrairement à §2.5 (plugin scope user, check sort du repo), ce check reste
// 100 % dans le repo — c'est exactement ce que le scope projet d'un MCP permet,
// et c'est le point pédagogique de la section.

import { existsSync, readFileSync } from 'node:fs';

const MCP_PATH = '.mcp.json';
const BOARD_PATH = 'src/components/Board.tsx';
const PAGE_PATH = 'src/app/page.tsx';
const errors: string[] = [];

type McpConfig = {
  mcpServers?: Record<string, { command?: string; args?: readonly string[] }>;
};

// 1. .mcp.json présent + JSON valide + serveur context7 déclaré.
if (!existsSync(MCP_PATH)) {
  errors.push(
    `Fichier introuvable : ${MCP_PATH}. Déclarez le serveur MCP Context7 à la racine du repo (cf. prompts/2.6.md).`,
  );
} else {
  try {
    const config = JSON.parse(readFileSync(MCP_PATH, 'utf-8')) as McpConfig;
    const servers = config.mcpServers;
    if (!servers || Object.keys(servers).length === 0) {
      errors.push(`${MCP_PATH} : clé \`mcpServers\` absente ou vide.`);
    } else {
      const context7Key = Object.keys(servers).find((k) => k.toLowerCase().includes('context7'));
      if (!context7Key) {
        errors.push(
          `${MCP_PATH} : aucune entrée \`context7\` dans \`mcpServers\` (insensible à la casse).`,
        );
      } else {
        const server = servers[context7Key];
        if (!server || typeof server.command !== 'string' || server.command.length === 0) {
          errors.push(
            `${MCP_PATH} : le serveur \`${context7Key}\` n'a pas de \`command\` stdio valide.`,
          );
        }
      }
    }
  } catch (e) {
    errors.push(`${MCP_PATH} n'est pas du JSON valide : ${(e as Error).message}`);
  }
}

// 2. Board.tsx en client component avec bouton Next qui appelle step(.
if (!existsSync(BOARD_PATH)) {
  errors.push(`Fichier introuvable : ${BOARD_PATH}.`);
} else {
  const board = readFileSync(BOARD_PATH, 'utf-8');
  const firstNonEmpty =
    board
      .split('\n')
      .find((line) => line.trim().length > 0)
      ?.trim() ?? '';
  if (!/^['"]use client['"];?$/.test(firstNonEmpty)) {
    errors.push(
      `${BOARD_PATH} : la directive \`'use client'\` doit être la première ligne non-vide (cf. doc Next via Context7).`,
    );
  }
  // Tolérance forward-compat §2.9 : le `<button>` Next initial peut avoir été
  // extrait dans `<SimulatorControls>` (4 boutons Play/Pause/Step/Reset).
  if (!/<button\b|<SimulatorControls\b/.test(board)) {
    errors.push(
      `${BOARD_PATH} doit contenir un \`<button>\` (ou les avoir extraits dans \`<SimulatorControls />\` à partir de §2.9).`,
    );
  }
  // Tolérance forward-compat §2.9 : Board peut soit appeler `step(` directement
  // (état §2.6), soit passer par `tick(` du simulator (état §2.9 — qui contient
  // l'appel à `step` au niveau de `core/simulator.ts`).
  // Tolérance forward-compat §3.1 : la mécanique peut vivre dans le custom hook
  // extrait `use-simulator.ts`. On agrège les surfaces avant la recherche.
  // Tolérance forward-compat §3.3 : la fonction d'avancement peut être nommée
  // `tickWithRule`, `tickOnce`, etc. — on accepte tout identifiant qui commence
  // par `step` ou `tick` (mot-frontière à gauche, suffixe libre, puis `(`).
  const hookPath = 'src/components/use-simulator.ts';
  const hook = existsSync(hookPath) ? readFileSync(hookPath, 'utf-8') : '';
  const boardSurface = `${board}\n${hook}`;
  if (!/\b(step|tick)\w*\s*\(/.test(boardSurface)) {
    errors.push(
      `${BOARD_PATH} (ou son hook extrait) doit avancer d'une génération (appel à \`step…(\` ou \`tick…(\` — y compris \`tickWithRule(\` via le simulator §2.9/§3.3).`,
    );
  }
  if (
    !/from\s+['"]@\/core\/(step|simulator)['"]|from\s+['"]\.\.\/core\/(step|simulator)['"]/.test(
      boardSurface,
    )
  ) {
    errors.push(
      `${BOARD_PATH} (ou son hook extrait) doit importer \`step\` ou le simulator depuis \`@/core/\`.`,
    );
  }
}

// 3. page.tsx passe initialGrid à <Board />.
if (!existsSync(PAGE_PATH)) {
  errors.push(`Fichier introuvable : ${PAGE_PATH}.`);
} else {
  const page = readFileSync(PAGE_PATH, 'utf-8');
  if (!/<Board\b[^>]*\binitialGrid\s*=/.test(page)) {
    errors.push(`${PAGE_PATH} doit passer \`initialGrid={...}\` à \`<Board />\`.`);
  }
}

if (errors.length === 0) {
  console.log('✅ check-2.6');
  console.log(`   ↳ ${MCP_PATH} déclare un serveur \`context7\` (scope projet, versionné).`);
  console.log('   ↳ Board.tsx est un client component avec bouton « Next » → step().');
  console.log('   ↳ page.tsx passe le seed initial via `initialGrid`.');
  console.log('');
  console.log('💡 Concept §2.6 — un MCP au scope projet voyage avec le repo.');
  console.log("   Ce check reste 100 % dans le repo : c'est exactement le point.");
  process.exit(0);
}

console.log('❌ check-2.6');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §2.6 mise en place (ou prompts/2.6.md en bouée).');
process.exit(1);
