---
name: vitest-test
description: Écrit un test Vitest (fonction pure ou composant React) selon les conventions du projet — AAA / given-when-then, describe + it, helpers nommés. Pour un composant React Next, applique d'abord le skill next-component.
---

# Skill — `vitest-test`

Tu écris un test Vitest pour ce projet. Le test est **co-localisé** avec le sujet (`grid.ts` → `grid.test.ts` à côté). Les conventions globales sont dans `CLAUDE.md`.

## Composition

Pour un test de **composant React**, ce skill s'appuie sur `next-component` :

- Réfère-toi d'abord à `@.claude/skills/next-component/SKILL.md` pour comprendre comment le composant est structuré (server vs client, typage des props, naming).
- Le test consomme ensuite ce contrat sans le redéfinir.

C'est ce qu'on appelle un *composable skill* — un skill spécialisé (`next-component`) est invoqué par un skill plus large (`vitest-test`) sans duplication.

## Structure d'un test

Trois couches :

1. **`describe`** — sujet (nom de la fonction ou du composant) + brève précision du contrat testé.
2. **`it`** — un cas par comportement attendu, titre en *given/when/then* compact.
3. **Corps AAA** — arrange (données + helpers), act (un seul appel `sut = …`), assert (`expect`).

Le sujet sous test s'appelle toujours `sut` (system under test).

## Règles

- Pas de `any`. Types inférés ou explicites depuis le module testé.
- Helpers locaux nommés en haut du fichier (constantes `O`/`_` pour les grilles, par exemple).
- Un test = une assertion principale. Si plusieurs `expect`, ils décrivent **un seul comportement**.
- Pas de mock pour le code `core/` — c'est pur, on l'appelle directement.
- Pour les composants React : pas de test UI tant que `@testing-library/react` n'est pas installé (cf. §2.5, reporté à §3.x).

## Squelette pour une fonction pure (core/)

```ts
import { describe, expect, it } from 'vitest';
import { maFonction } from './ma-fonction';

describe('maFonction — contrat', () => {
  it('cas nominal — retourne le résultat attendu', () => {
    const input = /* … */;

    const sut = maFonction(input);

    expect(sut).toEqual(/* … */);
  });
});
```

Pas de commentaire dans le corps des tests — les titres `it(...)` doivent porter le sens.
