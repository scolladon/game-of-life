// Check §2.1 — Modèles et niveaux d'effort.
//
// Valide que CLAUDE.md documente :
//   - les 3 modèles de la famille Claude actuelle ;
//   - une grille de décision "tâche → modèle → pourquoi" (≥ 3 lignes) ;
//   - au moins un mécanisme pour changer de modèle ad-hoc ;
//   - le levier extended thinking.
//
// Le `@AGENTS.md` initial doit rester en place (seed Architecture harness,
// complétée en §2.3).

import { existsSync, readFileSync } from 'node:fs';

const CLAUDE_MD = 'CLAUDE.md';
const errors: string[] = [];

if (!existsSync(CLAUDE_MD)) {
  errors.push(`Fichier introuvable : ${CLAUDE_MD}`);
} else {
  const content = readFileSync(CLAUDE_MD, 'utf-8');

  // 1. Garde-fou : @AGENTS.md préservé.
  if (!/@AGENTS\.md/.test(content)) {
    errors.push("La référence `@AGENTS.md` a disparu de CLAUDE.md (à conserver).");
  }

  // 2. Section dédiée aux modèles.
  const sectionMatch = content.match(/##\s+Mod[èe]les[^\n]*\n([\s\S]+?)(?=\n##\s|\n#\s|$)/i);
  if (!sectionMatch) {
    errors.push("Aucune section `## Modèles…` trouvée dans CLAUDE.md.");
  } else {
    const section = sectionMatch[1];

    // 3. Les 3 modèles cités (tolérant aux variantes de nommage).
    const modelPatterns: { name: string; pattern: RegExp }[] = [
      { name: 'Opus 4', pattern: /\b(opus[\s\-_]*4|claude[\s\-_]*opus[\s\-_]*4)/i },
      { name: 'Sonnet 4', pattern: /\b(sonnet[\s\-_]*4|claude[\s\-_]*sonnet[\s\-_]*4)/i },
      { name: 'Haiku 4', pattern: /\b(haiku[\s\-_]*4|claude[\s\-_]*haiku[\s\-_]*4)/i },
    ];
    for (const { name, pattern } of modelPatterns) {
      if (!pattern.test(section)) {
        errors.push(`Modèle non mentionné dans la section Modèles : ${name}`);
      }
    }

    // 4. Tableau de décision : ≥ 3 lignes de données avec ≥ 3 colonnes.
    const tableRows = section
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('|') && line.endsWith('|'))
      .filter((line) => !/^\|\s*[-:]+\s*(\|\s*[-:]+\s*)+\|$/.test(line));
    const dataRows = tableRows.filter((line) => {
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      return cells.length >= 3 && cells.every((c) => c.length > 0);
    });
    // On retire l'en-tête (1ère ligne data non séparateur).
    const dataOnly = dataRows.length > 0 ? dataRows.slice(1) : [];
    if (dataOnly.length < 3) {
      errors.push(
        `Grille de décision incomplète : ${dataOnly.length} ligne(s) trouvée(s), 3 minimum attendues (colonnes type | modèle | pourquoi).`,
      );
    }

    // 5. Mécanisme de switch ad-hoc.
    const switchMechanisms = /(\/model\b|--model\b|settings\.json)/;
    if (!switchMechanisms.test(section)) {
      errors.push(
        "Aucun mécanisme de changement de modèle documenté (attendu : `/model`, `--model` ou `settings.json`).",
      );
    }

    // 6. Mention de l'extended thinking.
    const thinking = /(extended\s+thinking|niveau\s+d['’]effort|MAX_THINKING_TOKENS|Opt\+T|Alt\+T)/i;
    if (!thinking.test(section)) {
      errors.push(
        "L'extended thinking n'est pas évoqué (attendu : `extended thinking`, `Opt+T`, `MAX_THINKING_TOKENS`…).",
      );
    }
  }
}

if (errors.length === 0) {
  console.log('✅ check-2.1');
  console.log('   ↳ CLAUDE.md documente les modèles, la grille de décision,');
  console.log('     le switch ad-hoc et l\'extended thinking.');
  console.log('');
  console.log('💡 Concept §2.1 — le projet documente ses propres règles pour que');
  console.log('   Claude Code les applique tout seul. La grille est une *décision*');
  console.log('   d\'équipe, pas une encyclopédie des modèles.');
  process.exit(0);
}

console.log('❌ check-2.1');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slide §2.1 mise en place (ou prompts/2.1.md en bouée).');
process.exit(1);
