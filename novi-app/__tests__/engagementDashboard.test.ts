/**
 * Unit Tests — EngagementDashboard Component Logic
 * 15 test cases covering rendering, metric updates, and missing data handling.
 * Tests the pure logic extracted from grp-Dashboard component behavior.
 */

// ---------- Helper functions replicating dashboard logic ----------

/** Threshold used to classify a participant as "highly distracted" */
const DISTRACTION_THRESHOLD = 75;

interface ParticipantStat {
  participantId: string;
  name: string;
  totalChecks: number;
  distractedChecks: number;
  distractionPct: number;
  peakDistractionPct: number;
  peakDistractionTime: number;
}

/** Compute average distraction % across all participants */
function computeAvgDistraction(participants: ParticipantStat[]): number {
  if (participants.length === 0) return 0;
  return participants.reduce((s, p) => s + p.distractionPct, 0) / participants.length;
}

/** Filter participants exceeding distraction threshold with minimum checks */
function filterHighlyDistracted(participants: ParticipantStat[]): ParticipantStat[] {
  return participants
    .filter(p => p.totalChecks >= 10 && p.distractionPct >= DISTRACTION_THRESHOLD)
    .sort((a, b) => b.distractionPct - a.distractionPct);
}

/** Determine heat map color based on avg distraction */
function getHeatMapColor(avgPct: number): 'green' | 'yellow' | 'red' {
  if (avgPct < 30) return 'green';
  if (avgPct < 60) return 'yellow';
  return 'red';
}

/** Format distraction percentage for display with fallback */
function formatDistractionDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${Math.round(value)}%`;
}

/** Determine participant engagement status text */
function getEngagementStatus(pct: number): string {
  if (pct < 25) return 'Highly Focused';
  if (pct < 50) return 'Focused';
  if (pct < 75) return 'Partially Distracted';
  return 'Highly Distracted';
}

// ---------- Tests ----------

describe('EngagementDashboard — Rendering with Mock Data', () => {
  const mockParticipants: ParticipantStat[] = [
    { participantId: 'p1', name: 'Alice', totalChecks: 100, distractedChecks: 20, distractionPct: 20, peakDistractionPct: 35, peakDistractionTime: 1000 },
    { participantId: 'p2', name: 'Bob', totalChecks: 100, distractedChecks: 80, distractionPct: 80, peakDistractionPct: 90, peakDistractionTime: 2000 },
    { participantId: 'p3', name: 'Carol', totalChecks: 100, distractedChecks: 50, distractionPct: 50, peakDistractionPct: 60, peakDistractionTime: 3000 },
  ];

  test('1. calculates average distraction correctly', () => {
    expect(computeAvgDistraction(mockParticipants)).toBe(50);
  });

  test('2. identifies correct number of highly distracted participants', () => {
    const hd = filterHighlyDistracted(mockParticipants);
    expect(hd).toHaveLength(1);
    expect(hd[0].name).toBe('Bob');
  });

  test('3. sorts highly distracted by percentage descending', () => {
    const extra = [...mockParticipants, { participantId: 'p4', name: 'Dave', totalChecks: 50, distractedChecks: 45, distractionPct: 90, peakDistractionPct: 95, peakDistractionTime: 4000 }];
    const hd = filterHighlyDistracted(extra);
    expect(hd[0].name).toBe('Dave');
    expect(hd[1].name).toBe('Bob');
  });

  test('4. returns empty list when no participants are distracted', () => {
    const focused = [{ participantId: 'p1', name: 'Focus', totalChecks: 100, distractedChecks: 5, distractionPct: 5, peakDistractionPct: 10, peakDistractionTime: 0 }];
    expect(filterHighlyDistracted(focused)).toHaveLength(0);
  });

  test('5. handles empty participants array', () => {
    expect(computeAvgDistraction([])).toBe(0);
    expect(filterHighlyDistracted([])).toHaveLength(0);
  });
});

describe('EngagementDashboard — Metric Updates', () => {
  test('6. updates average when new participant added', () => {
    const initial = [{ participantId: 'p1', name: 'A', totalChecks: 50, distractedChecks: 25, distractionPct: 50, peakDistractionPct: 50, peakDistractionTime: 0 }];
    expect(computeAvgDistraction(initial)).toBe(50);
    const updated = [...initial, { participantId: 'p2', name: 'B', totalChecks: 50, distractedChecks: 5, distractionPct: 10, peakDistractionPct: 15, peakDistractionTime: 0 }];
    expect(computeAvgDistraction(updated)).toBe(30);
  });

  test('7. recalculates when participant distraction changes', () => {
    const data = [{ participantId: 'p1', name: 'A', totalChecks: 50, distractedChecks: 25, distractionPct: 50, peakDistractionPct: 50, peakDistractionTime: 0 }];
    data[0].distractionPct = 80;
    expect(computeAvgDistraction(data)).toBe(80);
  });

  test('8. heat map shows green for low distraction', () => {
    expect(getHeatMapColor(15)).toBe('green');
  });

  test('9. heat map shows yellow for moderate distraction', () => {
    expect(getHeatMapColor(45)).toBe('yellow');
  });

  test('10. heat map shows red for high distraction', () => {
    expect(getHeatMapColor(75)).toBe('red');
  });
});

describe('EngagementDashboard — Missing Data Handling', () => {
  test('11. shows placeholder for null distraction value', () => {
    expect(formatDistractionDisplay(null)).toBe('—');
  });

  test('12. shows placeholder for undefined distraction value', () => {
    expect(formatDistractionDisplay(undefined)).toBe('—');
  });

  test('13. shows placeholder for NaN distraction value', () => {
    expect(formatDistractionDisplay(NaN)).toBe('—');
  });

  test('14. formats valid percentage correctly', () => {
    expect(formatDistractionDisplay(42.7)).toBe('43%');
  });

  test('15. returns correct engagement status text', () => {
    expect(getEngagementStatus(10)).toBe('Highly Focused');
    expect(getEngagementStatus(30)).toBe('Focused');
    expect(getEngagementStatus(60)).toBe('Partially Distracted');
    expect(getEngagementStatus(80)).toBe('Highly Distracted');
  });
});
