/**
 * Règles de la famille « Game of Life ».
 *
 * Une règle est définie par deux ensembles :
 *  - `birth`    : nombres de voisins vivants qui font *naître* une cellule morte.
 *  - `survive`  : nombres de voisins vivants qui font *survivre* une cellule vivante.
 *
 * Notation traditionnelle B{birth}/S{survive} (ex. B3/S23 = Conway).
 */

export interface Rule {
  readonly name: string;
  readonly displayName: string;
  readonly birth: readonly number[];
  readonly survive: readonly number[];
}

export const CONWAY: Rule = Object.freeze({
  name: 'conway',
  displayName: 'Conway (B3/S23)',
  birth: Object.freeze([3]),
  survive: Object.freeze([2, 3]),
}) as Rule;

export const HIGHLIFE: Rule = Object.freeze({
  name: 'highlife',
  displayName: 'HighLife (B36/S23)',
  birth: Object.freeze([3, 6]),
  survive: Object.freeze([2, 3]),
}) as Rule;

export const RULES: readonly Rule[] = Object.freeze([CONWAY, HIGHLIFE]);

export function getRule(name: string): Rule {
  const rule = RULES.find((r) => r.name === name);
  if (!rule) {
    throw new RangeError(`Unknown rule: "${name}". Known: ${RULES.map((r) => r.name).join(', ')}.`);
  }
  return rule;
}
