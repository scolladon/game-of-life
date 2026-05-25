// Check §1.4 — Mécanique de Claude Code + premier hello world.
//
// Valide la feature livrée : page d'accueil Game of Life en français
// (remplace le boilerplate Next.js par défaut).
//
// Le concept §1.4 (boucle d'agent) s'observe en session live ; ce check
// vérifie le résultat, pas l'usage de Claude Code.

import { existsSync, readFileSync } from 'node:fs';

const PAGE_PATH = 'src/app/page.tsx';
const errors: string[] = [];

if (!existsSync(PAGE_PATH)) {
  errors.push(`Fichier introuvable : ${PAGE_PATH}`);
} else {
  const content = readFileSync(PAGE_PATH, 'utf-8');

  // 1. Composant React exporté par défaut
  if (!/export\s+default\s+function/.test(content) && !/export\s+default\s+\w+/.test(content)) {
    errors.push('Composant exporté par défaut introuvable dans page.tsx');
  }

  // 2. Mention "Game of Life"
  if (!/game of life/i.test(content)) {
    errors.push('La page ne contient pas "Game of Life"');
  }

  // 3. Boilerplate Next/Vercel retiré
  const forbidden: { pattern: RegExp; label: string }[] = [
    { pattern: /next\.svg/i, label: 'next.svg' },
    { pattern: /vercel\.svg/i, label: 'vercel.svg' },
    { pattern: /To get started, edit/i, label: 'texte "To get started, edit"' },
    { pattern: /vercel\.com/i, label: 'lien vercel.com' },
  ];
  for (const { pattern, label } of forbidden) {
    if (pattern.test(content)) {
      errors.push(`Boilerplate Next/Vercel encore présent : ${label}`);
    }
  }

  // 4. Au moins un mot-clé français (preuve de localisation)
  const frenchKeywords = /(jeu|simulation|automate|cellulaire|Conway|jouer|d[ée]marrer|vie)/i;
  if (!frenchKeywords.test(content)) {
    errors.push(
      "La page ne contient aucun mot-clé français attendu (jeu, simulation, automate, cellulaire, Conway, jouer, démarrer, vie)",
    );
  }
}

if (errors.length === 0) {
  console.log('✅ check-1.4');
  console.log("   ↳ Page d'accueil Game of Life en place, boilerplate Next/Vercel nettoyé.");
  console.log("");
  console.log("💡 Concept §1.4 — la boucle d'agent s'observe en session live.");
  console.log("   Ce check valide le résultat ; le vrai apprentissage est l'observation");
  console.log("   pendant la session Claude Code (Read → Edit → fin).");
  process.exit(0);
}

console.log('❌ check-1.4');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §1.4 mise en place (prompt à copier-coller dans Claude Code).');
process.exit(1);
