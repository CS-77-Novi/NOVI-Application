/**
 * Unit Tests — Gaze Detection Module (ml-calculations/gaze.js)
 * Tests the updateGaze() function that determines eye gaze direction
 * using iris position relative to eye corner landmarks.
 */
import { updateGaze } from '@/ml-calculations/gaze';

function makeLandmarks(overrides: Record<number, { x: number; y: number }> = {}) {
  const base = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  for (const [idx, val] of Object.entries(overrides)) {
    base[Number(idx)] = { ...base[Number(idx)], ...val };
  }
  return base;
}

const CENTERED_EYES: Record<number, { x: number; y: number }> = {
  33: { x: 0.35, y: 0.40 }, 133: { x: 0.45, y: 0.40 },
  362: { x: 0.55, y: 0.40 }, 263: { x: 0.65, y: 0.40 },
  468: { x: 0.40, y: 0.40 }, 469: { x: 0.40, y: 0.40 }, 470: { x: 0.40, y: 0.40 },
  471: { x: 0.40, y: 0.40 }, 472: { x: 0.40, y: 0.40 },
  473: { x: 0.60, y: 0.40 }, 474: { x: 0.60, y: 0.40 }, 475: { x: 0.60, y: 0.40 },
  476: { x: 0.60, y: 0.40 }, 477: { x: 0.60, y: 0.40 },
};
const W = 640, H = 480;

describe('Gaze Detection Module', () => {
  test('TC-1: detects CENTER gaze when irises are centered', () => {
    const result = updateGaze(makeLandmarks(CENTERED_EYES), W, H);
    expect(result.gaze).toBe('CENTER');
  });

  test('TC-2: detects LEFT gaze when irises shift toward inner corners', () => {
    const o = { ...CENTERED_EYES };
    [468,469,470,471,472].forEach(i => o[i] = { x: 0.46, y: 0.40 });
    [473,474,475,476,477].forEach(i => o[i] = { x: 0.66, y: 0.40 });
    expect(updateGaze(makeLandmarks(o), W, H).gaze).toBe('LEFT');
  });

  test('TC-3: detects RIGHT gaze when irises shift toward outer corners', () => {
    const o = { ...CENTERED_EYES };
    [468,469,470,471,472].forEach(i => o[i] = { x: 0.34, y: 0.40 });
    [473,474,475,476,477].forEach(i => o[i] = { x: 0.54, y: 0.40 });
    expect(updateGaze(makeLandmarks(o), W, H).gaze).toBe('RIGHT');
  });

  test('TC-4: detects UP gaze when irises positioned above eye center', () => {
    const o = { ...CENTERED_EYES };
    [468,469,470,471,472].forEach(i => o[i] = { x: 0.40, y: 0.35 });
    [473,474,475,476,477].forEach(i => o[i] = { x: 0.60, y: 0.35 });
    expect(updateGaze(makeLandmarks(o), W, H).gaze).toBe('UP');
  });

  test('TC-5: detects DOWN gaze when irises positioned below eye center', () => {
    const o = { ...CENTERED_EYES };
    [468,469,470,471,472].forEach(i => o[i] = { x: 0.40, y: 0.42 });
    [473,474,475,476,477].forEach(i => o[i] = { x: 0.60, y: 0.42 });
    expect(updateGaze(makeLandmarks(o), W, H).gaze).toBe('DOWN');
  });

  test('TC-6: returns valid horizontalRatio and verticalRatio numbers', () => {
    const r = updateGaze(makeLandmarks(CENTERED_EYES), W, H);
    expect(typeof r.horizontalRatio).toBe('number');
    expect(typeof r.verticalRatio).toBe('number');
    expect(r.horizontalRatio).toBeGreaterThan(0);
    expect(r.horizontalRatio).toBeLessThan(1);
  });
});
