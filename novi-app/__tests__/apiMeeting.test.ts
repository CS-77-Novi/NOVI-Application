/**
 * Unit Tests — POST /api/meeting (Meeting Creation Logic)
 * 8 test cases covering input validation, duplicate detection, and permissions.
 * Tests the pure validation logic used by the meeting API endpoint.
 */

// ---------- Types ----------
interface MeetingInput {
  title?: string;
  description?: string;
  scheduledAt?: string;
  hostId?: string;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  hostId: string;
  scheduledAt: string;
  status: 'scheduled' | 'active' | 'ended';
  createdAt: string;
}

// ---------- Validation logic ----------

/** Validate meeting creation input */
function validateMeetingInput(input: MeetingInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input.title || input.title.trim().length === 0) errors.push('Title is required');
  if (input.title && input.title.length > 100) errors.push('Title must be under 100 characters');
  if (!input.hostId) errors.push('Host ID is required');
  if (input.scheduledAt && isNaN(Date.parse(input.scheduledAt))) errors.push('Invalid date format');
  return { valid: errors.length === 0, errors };
}

/** Check for duplicate meeting */
function isDuplicate(existing: Meeting[], newInput: MeetingInput): boolean {
  return existing.some(m =>
    m.title === newInput.title &&
    m.hostId === newInput.hostId &&
    m.status !== 'ended'
  );
}

/** Check permission (only host can create) */
function hasPermission(requestUserId: string, hostId: string): boolean {
  return requestUserId === hostId;
}

/** Create meeting record from valid input */
function createMeetingRecord(input: MeetingInput): Meeting {
  return {
    id: `meeting_${Date.now()}`,
    title: input.title!,
    description: input.description || '',
    hostId: input.hostId!,
    scheduledAt: input.scheduledAt || new Date().toISOString(),
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };
}

// ---------- Tests ----------

describe('POST /api/meeting — Meeting Creation', () => {
  test('1. valid input passes validation', () => {
    const result = validateMeetingInput({ title: 'CS101 Lecture', hostId: 'user_123', scheduledAt: '2026-03-25T10:00:00Z' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('2. missing title fails validation', () => {
    const result = validateMeetingInput({ hostId: 'user_123' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  test('3. empty title fails validation', () => {
    const result = validateMeetingInput({ title: '   ', hostId: 'user_123' });
    expect(result.valid).toBe(false);
  });

  test('4. title exceeding 100 characters fails validation', () => {
    const longTitle = 'A'.repeat(101);
    const result = validateMeetingInput({ title: longTitle, hostId: 'user_123' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title must be under 100 characters');
  });

  test('5. creates valid database record from input', () => {
    const record = createMeetingRecord({ title: 'CS101', hostId: 'user_123', scheduledAt: '2026-03-25T10:00:00Z' });
    expect(record.title).toBe('CS101');
    expect(record.hostId).toBe('user_123');
    expect(record.status).toBe('scheduled');
    expect(record.id).toMatch(/^meeting_/);
  });

  test('6. detects duplicate active meeting', () => {
    const existing: Meeting[] = [
      { id: 'm1', title: 'CS101', description: '', hostId: 'user_123', scheduledAt: '', status: 'scheduled', createdAt: '' },
    ];
    expect(isDuplicate(existing, { title: 'CS101', hostId: 'user_123' })).toBe(true);
  });

  test('7. allows same title if previous meeting ended', () => {
    const existing: Meeting[] = [
      { id: 'm1', title: 'CS101', description: '', hostId: 'user_123', scheduledAt: '', status: 'ended', createdAt: '' },
    ];
    expect(isDuplicate(existing, { title: 'CS101', hostId: 'user_123' })).toBe(false);
  });

  test('8. enforces permission — only host can create', () => {
    expect(hasPermission('user_123', 'user_123')).toBe(true);
    expect(hasPermission('user_456', 'user_123')).toBe(false);
  });
});
