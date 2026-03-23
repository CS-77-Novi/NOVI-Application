/**
 * Unit Tests — Combined Distraction Detection (ml-calculations/combined.js)
 * Tests detectDistraction() which orchestrates head posture + gaze detection.
 */
jest.mock('@/ml-calculations/headPosture', () => ({
  initHeadPosture: jest.fn(),
  updateHeadPosture: jest.fn(),
  isLookingAway: jest.fn(),
  calculateYawPitch: jest.fn(),
}));
jest.mock('@/ml-calculations/gaze', () => ({ updateGaze: jest.fn() }));
jest.mock('@mediapipe/tasks-vision', () => ({
  FaceLandmarker: { createFromOptions: jest.fn() },
  FilesetResolver: { forVisionTasks: jest.fn() },
}));

import { detectDistraction } from '@/ml-calculations/combined';
import { updateHeadPosture } from '@/ml-calculations/headPosture';

const mockVideo = { readyState: 4, videoWidth: 640, videoHeight: 480 } as any;

describe('Combined Distraction Detection', () => {
  beforeEach(() => jest.clearAllMocks());

  test('TC-12: returns null when video is not ready', () => {
    expect(detectDistraction({ readyState: 1 } as any, 640, 480, Date.now())).toBeNull();
  });

  test('TC-13: returns null when dimensions are zero', () => {
    expect(detectDistraction(mockVideo, 0, 0, Date.now())).toBeNull();
  });

  test('TC-14: returns NO FACE when head posture finds no face', () => {
    (updateHeadPosture as jest.Mock).mockReturnValue({ status: 'NO FACE' });
    const r = detectDistraction(mockVideo, 640, 480, Date.now());
    expect(r!.status).toBe('NO FACE');
    expect(r!.headPosture).toBeNull();
  });

  test('TC-15: returns FOCUSED when head is centered', () => {
    (updateHeadPosture as jest.Mock).mockReturnValue({ status: 'FOCUSED', yaw: 0, pitch: 12 });
    const r = detectDistraction(mockVideo, 640, 480, Date.now());
    expect(r!.status).toBe('FOCUSED');
    expect(r!.headPosture).toEqual({ yaw: 0, pitch: 12 });
  });

  test('TC-16: returns DISTRACTED when head posture indicates looking away', () => {
    (updateHeadPosture as jest.Mock).mockReturnValue({ status: 'DISTRACTED', yaw: -15, pitch: 10 });
    const r = detectDistraction(mockVideo, 640, 480, Date.now());
    expect(r!.status).toBe('DISTRACTED');
  });

  test('TC-17: returns ERROR on unexpected exceptions', () => {
    (updateHeadPosture as jest.Mock).mockImplementation(() => { throw new Error('GPU failure'); });
    const r = detectDistraction(mockVideo, 640, 480, Date.now());
    expect(r!.status).toBe('ERROR');
  });
});
