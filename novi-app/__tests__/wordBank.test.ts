/**
 * Unit Tests — Word Bank Module (constants/wordBank.ts)
 * Tests static word bank, fetchRandomWords(), and fetchDefinition().
 */
jest.mock('@/data/dictionary.json', () => [
  'alpha','beta','gamma','delta','epsilon','zeta','theta','kappa','lambda','sigma',
  'ab','xyz','exceedingly',
], { virtual: true });

import WORD_BANK, { fetchRandomWords, fetchDefinition } from '@/constants/wordBank';

const origFetch = global.fetch;

describe('Word Bank — Static Data', () => {
  test('TC-21: WORD_BANK contains entries with valid word and clue', () => {
    expect(Array.isArray(WORD_BANK)).toBe(true);
    expect(WORD_BANK.length).toBeGreaterThanOrEqual(20);
    for (const e of WORD_BANK) {
      expect(e.word).toBe(e.word.toUpperCase());
      expect(e.clue.length).toBeGreaterThan(0);
    }
  });
});

describe('Word Bank — fetchRandomWords()', () => {
  test('TC-22: returns uppercase words between 4-10 chars', async () => {
    const words = await fetchRandomWords(5);
    expect(words.length).toBeLessThanOrEqual(5);
    for (const e of words) {
      expect(e.word.length).toBeGreaterThanOrEqual(4);
      expect(e.word.length).toBeLessThanOrEqual(10);
      expect(e.word).toBe(e.word.toUpperCase());
    }
  });

  test('TC-23: returns fallback WORD_BANK on error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.resetModules();
    jest.doMock('@/data/dictionary.json', () => [], { virtual: true });
    const { fetchRandomWords: fetchBroken } = await import('@/constants/wordBank');
    const words = await fetchBroken(10);
    expect(words.length).toBeGreaterThanOrEqual(20);
    expect(words[0].clue.length).toBeGreaterThan(0);
    consoleSpy.mockRestore();
  });
});

describe('Word Bank — fetchDefinition()', () => {
  afterEach(() => { global.fetch = origFetch; });

  test('TC-24: returns null when API request fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    expect(await fetchDefinition('VARIABLE', 'https://api.example.com')).toBeNull();
  });
});
