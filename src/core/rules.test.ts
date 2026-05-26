import { describe, expect, it } from 'vitest';
import { CONWAY, getRule, HIGHLIFE, RULES } from './rules';

describe('rules — registre des règles Game of Life', () => {
  it('expose Conway avec la notation B3/S23', () => {
    expect(CONWAY.name).toBe('conway');
    expect(CONWAY.birth).toEqual([3]);
    expect(CONWAY.survive).toEqual([2, 3]);
  });

  it('expose HighLife avec la notation B36/S23', () => {
    expect(HIGHLIFE.name).toBe('highlife');
    expect(HIGHLIFE.birth).toEqual([3, 6]);
    expect(HIGHLIFE.survive).toEqual([2, 3]);
  });

  it('contient au moins Conway et HighLife dans le registre RULES', () => {
    expect(RULES).toContain(CONWAY);
    expect(RULES).toContain(HIGHLIFE);
  });

  it('getRule("conway") retourne la règle CONWAY', () => {
    expect(getRule('conway')).toBe(CONWAY);
  });

  it('getRule("highlife") retourne la règle HIGHLIFE', () => {
    expect(getRule('highlife')).toBe(HIGHLIFE);
  });

  it('getRule("inconnue") lève une RangeError explicite', () => {
    expect(() => getRule('inconnue')).toThrow(RangeError);
    expect(() => getRule('inconnue')).toThrow(/Unknown rule.*conway.*highlife/);
  });
});
