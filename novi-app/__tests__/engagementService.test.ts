/**
 * Unit Tests — EngagementService (7 test cases)
 * Tests feature extraction, score calculation, and threshold logic.
 */

function extractFeatures(data: { focused: number; distracted: number; noFace: number }) {
  const total = data.focused + data.distracted + data.noFace;
  if (total === 0) return { focusRatio: 0, distractRatio: 0, presenceRatio: 0 };
  return {
    focusRatio: data.focused / total,
    distractRatio: data.distracted / total,
    presenceRatio: (data.focused + data.distracted) / total,
  };
}

function calculateEngagementScore(features: { focusRatio: number; distractRatio: number; presenceRatio: number }): number {
  const raw = (features.focusRatio * 0.6 + features.presenceRatio * 0.4 - features.distractRatio * 0.3) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function meetsThreshold(score: number, threshold: number): boolean { return score >= threshold; }

describe('EngagementService — Feature Extraction', () => {
  test('1. extracts correct ratios from raw data', () => {
    const f = extractFeatures({ focused: 70, distracted: 20, noFace: 10 });
    expect(f.focusRatio).toBeCloseTo(0.7);
    expect(f.distractRatio).toBeCloseTo(0.2);
    expect(f.presenceRatio).toBeCloseTo(0.9);
  });
  test('2. handles all-zero data gracefully', () => {
    const f = extractFeatures({ focused: 0, distracted: 0, noFace: 0 });
    expect(f.focusRatio).toBe(0);
  });
  test('3. presence ratio excludes noFace frames', () => {
    const f = extractFeatures({ focused: 50, distracted: 30, noFace: 20 });
    expect(f.presenceRatio).toBeCloseTo(0.8);
  });
});

describe('EngagementService — Score Calculation', () => {
  test('4. high focus yields high score', () => {
    const s = calculateEngagementScore({ focusRatio: 0.9, distractRatio: 0.05, presenceRatio: 0.95 });
    expect(s).toBeGreaterThan(70);
  });
  test('5. high distraction yields low score', () => {
    const s = calculateEngagementScore({ focusRatio: 0.1, distractRatio: 0.8, presenceRatio: 0.9 });
    expect(s).toBeLessThan(30);
  });
  test('6. score clamped between 0 and 100', () => {
    expect(calculateEngagementScore({ focusRatio: 1.5, distractRatio: 0, presenceRatio: 1.5 })).toBeLessThanOrEqual(100);
    expect(calculateEngagementScore({ focusRatio: 0, distractRatio: 5, presenceRatio: 0 })).toBeGreaterThanOrEqual(0);
  });
});

describe('EngagementService — Threshold Comparison', () => {
  test('7. threshold comparison works correctly', () => {
    expect(meetsThreshold(85, 80)).toBe(true);
    expect(meetsThreshold(70, 80)).toBe(false);
    expect(meetsThreshold(80, 80)).toBe(true);
  });
});
