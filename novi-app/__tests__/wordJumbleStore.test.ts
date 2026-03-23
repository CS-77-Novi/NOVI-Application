/**
 * Unit Tests — Word Jumble Store (lib/wordJumbleStore.ts)
 * Tests save, get, and clear operations on the global game state.
 */
import {
  saveWordJumbleState, getWordJumbleState, clearWordJumbleState, WordJumbleState,
} from '@/lib/wordJumbleStore';

const mockState: WordJumbleState = {
  words: [{ word: 'FUNCTION', clue: 'A reusable block of code' }],
  wordIdx: 0, score: 150, streak: 3, solved: 5,
  currentEntry: { word: 'FUNCTION', clue: 'A reusable block of code' },
  scrambled: ['N','F','U','C','T','I','O','N'], selected: [1,0],
  timeLeft: 25, showClue: false, hintUsed: false, feedback: null,
};

describe('Word Jumble Store', () => {
  afterEach(() => clearWordJumbleState());

  test('TC-18: getWordJumbleState() returns null initially', () => {
    expect(getWordJumbleState()).toBeNull();
  });

  test('TC-19: saveWordJumbleState() stores state correctly', () => {
    saveWordJumbleState(mockState);
    const r = getWordJumbleState();
    expect(r).not.toBeNull();
    expect(r!.score).toBe(150);
    expect(r!.streak).toBe(3);
    expect(r!.words[0].word).toBe('FUNCTION');
  });

  test('TC-20: clearWordJumbleState() resets to null', () => {
    saveWordJumbleState(mockState);
    clearWordJumbleState();
    expect(getWordJumbleState()).toBeNull();
  });
});
