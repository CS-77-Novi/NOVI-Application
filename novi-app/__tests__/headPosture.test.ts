/**
 * Unit Tests — Head Posture Detection Module (ml-calculations/headPosture.js)
 * Tests isLookingAway() and calculateYawPitch() helper functions.
 */
import { isLookingAway, calculateYawPitch } from '@/ml-calculations/headPosture';

function makeFaceLandmarks(
  leftEye: { x: number; y: number },
  rightEye: { x: number; y: number },
  nose: { x: number; y: number }
) {
  const lm = Array.from({ length: 468 }, () => ({ x: 0, y: 0, z: 0 }));
  lm[33] = { ...lm[33], ...leftEye };
  lm[263] = { ...lm[263], ...rightEye };
  lm[1] = { ...lm[1], ...nose };
  return lm;
}

describe('Head Posture — isLookingAway()', () => {
  test('TC-7: returns false when yaw/pitch within threshold (focused)', () => {
    expect(isLookingAway(0, 12)).toBe(false);
    expect(isLookingAway(3, 10)).toBe(false);
    expect(isLookingAway(-4, 7)).toBe(false);
    expect(isLookingAway(4.9, 17.9)).toBe(false);
  });

  test('TC-8: returns true when yaw < -5 (head turned left)', () => {
    expect(isLookingAway(-6, 12)).toBe(true);
    expect(isLookingAway(-15, 10)).toBe(true);
  });

  test('TC-9: returns true when yaw > 5 (head turned right)', () => {
    expect(isLookingAway(6, 12)).toBe(true);
    expect(isLookingAway(20, 10)).toBe(true);
  });

  test('TC-10: returns true when pitch > 18 (looking up excessively)', () => {
    expect(isLookingAway(0, 19)).toBe(true);
    expect(isLookingAway(0, 25)).toBe(true);
  });
});

describe('Head Posture — calculateYawPitch()', () => {
  test('TC-11: returns near-zero yaw for a centered symmetrical face', () => {
    const lm = makeFaceLandmarks({ x: 0.40, y: 0.40 }, { x: 0.60, y: 0.40 }, { x: 0.50, y: 0.55 });
    const { yaw, pitch } = calculateYawPitch(lm, 640, 480);
    expect(Math.abs(yaw)).toBeLessThan(2);
    expect(isFinite(pitch)).toBe(true);
  });
});
