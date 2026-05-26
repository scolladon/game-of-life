---
name: next-component
description: Génère un composant React Next 16 idiomatique dans src/components/. À utiliser dès qu'un nouveau composant React est à créer (présentationnel ou interactif) — applique les règles serveur/client, le typage des props et le style Tailwind sobre du projet.
---

# Skill — `next-component`

Tu écris un composant React pour ce projet Next.js 16 (App Router). Voici les règles non négociables.

## Server vs client

- **Server component par défaut** (sans `'use client'`) : composants présentationnels purs (props in → JSX out), pas de `useState`, pas de `useEffect`, pas de handler.
- **Client component** (`'use client'` en *première ligne non vide* du fichier) seulement si le composant gère un état interne, des effets, ou des handlers d'événements DOM.

Référence officielle si doute : doc Next via `node_modules/next/dist/docs/` ou MCP Context7 (§2.6).

## Typage des props

- Toujours une `interface NomComposantProps` nommée juste au-dessus du composant.
- Props marquées `readonly` quand non muteables (immuabilité par défaut, cf. `CLAUDE.md`).
- Pas de `React.FC` — signature `function NomComposant({ ... }: NomComposantProps)` directe.
- Pas de `any`. `unknown` + type guard si la valeur vient de l'extérieur.

## Style Tailwind

- Palette **monochrome noir/blanc** (cohérence avec le `<Board>` posé en §2.5).
- Utilities seulement, pas de CSS-in-JS, pas de `style={{...}}` inline sauf cas extrême.
- Dark mode systématique via les variantes `dark:` quand pertinent.
- Pas d'emoji dans le rendu — sobriété.

## Emplacement et naming

- Fichier dans `src/components/`, nom `PascalCase.tsx` (ex. `GenerationCounter.tsx`).
- Un seul composant exporté par fichier.
- Export nommé (`export function …`), pas d'export default — alignement avec `Board.tsx`.

## Squelette minimal

```tsx
interface GenerationCounterProps {
  readonly count: number;
}

export function GenerationCounter({ count }: GenerationCounterProps) {
  return (
    <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
      Génération N°{count}
    </span>
  );
}
```

Pas de commentaire dans le corps du composant — le nommage doit suffire.
