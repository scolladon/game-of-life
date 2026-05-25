@AGENTS.md

## Modèles et niveaux d'effort

**Défaut projet : Sonnet 4.6.** Équilibre capacité/coût optimal pour le code
applicatif de ce projet (composants React, hooks, routes API Next.js, tests
Vitest).

| Type de tâche                                  | Modèle      | Pourquoi                                          |
|------------------------------------------------|-------------|---------------------------------------------------|
| Composant React, hook, route API, test Vitest  | Sonnet 4.6  | Meilleur coding model, 200k de contexte           |
| Refacto cross-fichiers, archi, debug épineux   | Opus 4.7    | Raisonnement profond, 1M de contexte              |
| Génération de tests, scaffolding, edits courts | Haiku 4.5   | ~3× moins cher que Sonnet, latence faible         |

### Changer de modèle ad-hoc

- `/model <name>` pendant la session (effet immédiat).
- `claude --model <name>` au lancement.
- `~/.claude/settings.json` pour fixer un défaut utilisateur global.

### Extended thinking (niveau d'effort)

Actif par défaut. Toggle via **Opt+T** (macOS) / **Alt+T** (Windows/Linux).
Plafonner sur tâches simples : `MAX_THINKING_TOKENS=10000`.
