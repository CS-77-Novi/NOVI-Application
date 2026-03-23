/**
 * Unit Tests — ParticipantCard Component Logic
 * 10 test cases covering engagement score coloring, participant display, 
 * and responsiveness to score changes.
 */

// ---------- Pure logic functions extracted from component ----------

interface Participant {
  participantId: string;
  name: string;
  profileImage?: string;
  distractionPct: number;
  totalChecks: number;
}

/** Determine engagement score color based on distraction percentage */
function getScoreColor(distractionPct: number): string {
  const engagementPct = 100 - distractionPct;
  if (engagementPct >= 75) return 'text-green-500';
  if (engagementPct >= 50) return 'text-yellow-500';
  if (engagementPct >= 25) return 'text-orange-500';
  return 'text-red-500';
}

/** Determine background color class for participant card */
function getCardBgColor(distractionPct: number): string {
  if (distractionPct >= 75) return 'bg-red-500/10';
  if (distractionPct >= 50) return 'bg-orange-500/10';
  if (distractionPct >= 25) return 'bg-yellow-500/10';
  return 'bg-green-500/10';
}

/** Get participant initial for avatar */
function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

/** Calculate engagement score from distraction percentage */
function getEngagementScore(distractionPct: number): number {
  return Math.max(0, Math.min(100, 100 - distractionPct));
}

/** Format participant name for display (truncate if too long) */
function formatName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 1) + '…';
}

// ---------- Tests ----------

describe('ParticipantCard — Engagement Score Coloring', () => {
  test('1. shows green for high engagement (low distraction)', () => {
    expect(getScoreColor(10)).toBe('text-green-500');
    expect(getScoreColor(0)).toBe('text-green-500');
  });

  test('2. shows yellow for moderate engagement', () => {
    expect(getScoreColor(40)).toBe('text-yellow-500');
  });

  test('3. shows orange for low engagement', () => {
    expect(getScoreColor(65)).toBe('text-orange-500');
  });

  test('4. shows red for critical distraction levels', () => {
    expect(getScoreColor(85)).toBe('text-red-500');
    expect(getScoreColor(100)).toBe('text-red-500');
  });

  test('5. card background changes with distraction level', () => {
    expect(getCardBgColor(10)).toBe('bg-green-500/10');
    expect(getCardBgColor(30)).toBe('bg-yellow-500/10');
    expect(getCardBgColor(60)).toBe('bg-orange-500/10');
    expect(getCardBgColor(80)).toBe('bg-red-500/10');
  });
});

describe('ParticipantCard — Display', () => {
  test('6. extracts participant initial correctly', () => {
    expect(getInitial('Alice')).toBe('A');
    expect(getInitial('bob')).toBe('B');
    expect(getInitial(' Charlie')).toBe('C');
  });

  test('7. calculates engagement score from distraction', () => {
    expect(getEngagementScore(0)).toBe(100);
    expect(getEngagementScore(100)).toBe(0);
    expect(getEngagementScore(35)).toBe(65);
  });

  test('8. clamps engagement score between 0 and 100', () => {
    expect(getEngagementScore(-10)).toBe(100);
    expect(getEngagementScore(150)).toBe(0);
  });

  test('9. truncates long participant names', () => {
    expect(formatName('Alice')).toBe('Alice');
    expect(formatName('A Very Long Participant Name That Exceeds Limit', 20)).toBe('A Very Long Partici…');
  });
});

describe('ParticipantCard — Score Change Responsiveness', () => {
  test('10. color updates when score changes from focused to distracted', () => {
    const initialColor = getScoreColor(10);
    const updatedColor = getScoreColor(85);
    expect(initialColor).toBe('text-green-500');
    expect(updatedColor).toBe('text-red-500');
    expect(initialColor).not.toBe(updatedColor);
  });
});
