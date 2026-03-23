/**
 * Unit Tests — GrammarService (6 test cases)
 * Tests grammar correction API calls, response parsing, and failure handling.
 */

interface GrammarResult { original: string; corrected: string; hasErrors: boolean; corrections: { from: string; to: string }[]; }

function parseGrammarResponse(apiResponse: any): GrammarResult | null {
  try {
    if (!apiResponse || !apiResponse.text) return null;
    const corrected = apiResponse.text;
    const original = apiResponse.original || '';
    const corrections = apiResponse.corrections || [];
    return { original, corrected, hasErrors: corrections.length > 0, corrections };
  } catch { return null; }
}

function checkGrammar(text: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (text.length === 0) errors.push('Empty text');
  if (!/^[A-Z]/.test(text)) errors.push('Should start with capital letter');
  if (!/[.!?]$/.test(text.trim())) errors.push('Should end with punctuation');
  const words = text.split(/\s+/);
  if (words.length < 3) errors.push('Sentence too short');
  return { isValid: errors.length === 0, errors };
}

async function callGrammarAPI(text: string): Promise<GrammarResult | null> {
  try {
    const res = await fetch('https://api.grammar.example/check', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    return parseGrammarResponse(await res.json());
  } catch { return null; }
}

const origFetch = global.fetch;

describe('GrammarService — Response Parsing', () => {
  test('1. parses valid API response correctly', () => {
    const r = parseGrammarResponse({ text: 'Hello world.', original: 'Hello wrold.', corrections: [{ from: 'wrold', to: 'world' }] });
    expect(r).not.toBeNull();
    expect(r!.corrected).toBe('Hello world.');
    expect(r!.hasErrors).toBe(true);
    expect(r!.corrections).toHaveLength(1);
  });

  test('2. returns null for invalid response', () => {
    expect(parseGrammarResponse(null)).toBeNull();
    expect(parseGrammarResponse({})).toBeNull();
    expect(parseGrammarResponse({ unrelated: true })).toBeNull();
  });

  test('3. handles response with no corrections', () => {
    const r = parseGrammarResponse({ text: 'Perfect.', original: 'Perfect.', corrections: [] });
    expect(r!.hasErrors).toBe(false);
  });
});

describe('GrammarService — Grammar Checking', () => {
  test('4. valid sentence passes all checks', () => {
    const r = checkGrammar('This is a valid sentence.');
    expect(r.isValid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  test('5. detects common errors', () => {
    const r = checkGrammar('no capital');
    expect(r.isValid).toBe(false);
    expect(r.errors).toContain('Should start with capital letter');
    expect(r.errors).toContain('Should end with punctuation');
  });
});

describe('GrammarService — API Failure Handling', () => {
  afterEach(() => { global.fetch = origFetch; });

  test('6. returns null on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const r = await callGrammarAPI('Test text.');
    expect(r).toBeNull();
  });
});
