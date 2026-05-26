import { describe, expect, it } from 'vitest';
import { getActiveTheme, themeTokens } from './tokens';

describe('themeTokens', () => {
  it('given the light theme then exposes the 5 required keys', () => {
    const sut = themeTokens.light;

    expect(sut.background).toBeTypeOf('string');
    expect(sut.foreground).toBeTypeOf('string');
    expect(sut.cellAlive).toBeTypeOf('string');
    expect(sut.cellDead).toBeTypeOf('string');
    expect(sut.accent).toBeTypeOf('string');
    expect(sut.background.length).toBeGreaterThan(0);
    expect(sut.cellAlive.length).toBeGreaterThan(0);
  });

  it('given the dark theme then exposes the 5 required keys', () => {
    const sut = themeTokens.dark;

    expect(sut.background).toBeTypeOf('string');
    expect(sut.foreground).toBeTypeOf('string');
    expect(sut.cellAlive).toBeTypeOf('string');
    expect(sut.cellDead).toBeTypeOf('string');
    expect(sut.accent).toBeTypeOf('string');
  });

  it('given light and dark themes then they use distinct background colors', () => {
    expect(themeTokens.light.background).not.toBe(themeTokens.dark.background);
  });
});

describe('getActiveTheme', () => {
  it('given no document (SSR) when called then returns "light" by default', () => {
    // Vitest tourne en Node — `document` est undefined.
    const sut = getActiveTheme();

    expect(sut).toBe('light');
  });
});
