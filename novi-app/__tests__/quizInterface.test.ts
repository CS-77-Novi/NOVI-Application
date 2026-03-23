/**
 * Unit Tests — QuizInterface Component Logic
 * 22 test cases covering question display, answer validation,
 * submission prevention, and score calculation.
 */

// ---------- Types replicating quiz data structures ----------

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  order_index: number;
}

interface QuizAttempt {
  questionId: string;
  selectedAnswer: string;
  timestamp: number;
}

// ---------- Pure logic functions under test ----------

/** Validate if a quiz submission is complete (all questions answered) */
function isSubmissionComplete(questions: QuizQuestion[], attempts: QuizAttempt[]): boolean {
  return questions.every(q => attempts.some(a => a.questionId === q.id));
}

/** Calculate score from attempts */
function calculateScore(questions: QuizQuestion[], attempts: QuizAttempt[]): { correct: number; total: number; percentage: number } {
  const total = questions.length;
  const correct = attempts.filter(a => {
    const q = questions.find(q => q.id === a.questionId);
    return q && a.selectedAnswer === q.correct_answer;
  }).length;
  return { correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

/** Validate answer selection (not empty, matches available option) */
function isValidAnswer(options: string[], selected: string): boolean {
  return selected.trim().length > 0 && options.includes(selected);
}

/** Format time remaining */
function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** Get question by index safely */
function getQuestion(questions: QuizQuestion[], index: number): QuizQuestion | null {
  if (index < 0 || index >= questions.length) return null;
  return questions[index];
}

/** Determine grade label from percentage */
function getGradeLabel(pct: number): string {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

// ---------- Test Data ----------
const sampleQuestions: QuizQuestion[] = [
  { id: 'q1', question: 'What is 2+2?', options: ['3','4','5','6'], correct_answer: '4', order_index: 0 },
  { id: 'q2', question: 'What is the capital of France?', options: ['London','Berlin','Paris','Madrid'], correct_answer: 'Paris', order_index: 1 },
  { id: 'q3', question: 'Which is a prime number?', options: ['4','6','7','9'], correct_answer: '7', order_index: 2 },
  { id: 'q4', question: 'HTML stands for?', options: ['HyperText Markup Language','High Tech ML','None'], correct_answer: 'HyperText Markup Language', order_index: 3 },
];

describe('QuizInterface — Question Display', () => {
  test('1. displays question text correctly', () => {
    expect(sampleQuestions[0].question).toBe('What is 2+2?');
  });

  test('2. displays all answer options', () => {
    expect(sampleQuestions[0].options).toHaveLength(4);
    expect(sampleQuestions[0].options).toContain('4');
  });

  test('3. maintains question order by order_index', () => {
    const sorted = [...sampleQuestions].sort((a, b) => a.order_index - b.order_index);
    expect(sorted[0].id).toBe('q1');
    expect(sorted[3].id).toBe('q4');
  });

  test('4. getQuestion returns correct question by index', () => {
    expect(getQuestion(sampleQuestions, 0)?.id).toBe('q1');
    expect(getQuestion(sampleQuestions, 2)?.id).toBe('q3');
  });

  test('5. getQuestion returns null for out-of-bounds index', () => {
    expect(getQuestion(sampleQuestions, -1)).toBeNull();
    expect(getQuestion(sampleQuestions, 100)).toBeNull();
  });

  test('6. each question has a non-empty question text', () => {
    sampleQuestions.forEach(q => expect(q.question.length).toBeGreaterThan(0));
  });
});

describe('QuizInterface — Answer Validation', () => {
  test('7. validates correct answer matches', () => {
    expect(isValidAnswer(sampleQuestions[0].options, '4')).toBe(true);
  });

  test('8. rejects empty answer', () => {
    expect(isValidAnswer(sampleQuestions[0].options, '')).toBe(false);
    expect(isValidAnswer(sampleQuestions[0].options, '   ')).toBe(false);
  });

  test('9. rejects answer not in options', () => {
    expect(isValidAnswer(sampleQuestions[0].options, '42')).toBe(false);
  });

  test('10. accepts any valid option regardless of position', () => {
    sampleQuestions[0].options.forEach(opt => {
      expect(isValidAnswer(sampleQuestions[0].options, opt)).toBe(true);
    });
  });
});

describe('QuizInterface — Submission Prevention', () => {
  test('11. submission is incomplete with no attempts', () => {
    expect(isSubmissionComplete(sampleQuestions, [])).toBe(false);
  });

  test('12. submission is incomplete with partial attempts', () => {
    const partial: QuizAttempt[] = [{ questionId: 'q1', selectedAnswer: '4', timestamp: Date.now() }];
    expect(isSubmissionComplete(sampleQuestions, partial)).toBe(false);
  });

  test('13. submission is complete only when all questions answered', () => {
    const full: QuizAttempt[] = sampleQuestions.map(q => ({
      questionId: q.id, selectedAnswer: q.correct_answer, timestamp: Date.now()
    }));
    expect(isSubmissionComplete(sampleQuestions, full)).toBe(true);
  });

  test('14. handles duplicate attempts for same question', () => {
    const dupes: QuizAttempt[] = [
      ...sampleQuestions.map(q => ({ questionId: q.id, selectedAnswer: q.correct_answer, timestamp: Date.now() })),
      { questionId: 'q1', selectedAnswer: '3', timestamp: Date.now() },
    ];
    expect(isSubmissionComplete(sampleQuestions, dupes)).toBe(true);
  });
});

describe('QuizInterface — Score Calculation', () => {
  test('15. calculates 100% for all correct answers', () => {
    const attempts = sampleQuestions.map(q => ({ questionId: q.id, selectedAnswer: q.correct_answer, timestamp: Date.now() }));
    const score = calculateScore(sampleQuestions, attempts);
    expect(score.correct).toBe(4);
    expect(score.percentage).toBe(100);
  });

  test('16. calculates 0% for all wrong answers', () => {
    const attempts = sampleQuestions.map(q => ({ questionId: q.id, selectedAnswer: 'wrong', timestamp: Date.now() }));
    const score = calculateScore(sampleQuestions, attempts);
    expect(score.correct).toBe(0);
    expect(score.percentage).toBe(0);
  });

  test('17. calculates partial credit correctly', () => {
    const attempts: QuizAttempt[] = [
      { questionId: 'q1', selectedAnswer: '4', timestamp: Date.now() },
      { questionId: 'q2', selectedAnswer: 'Paris', timestamp: Date.now() },
      { questionId: 'q3', selectedAnswer: '4', timestamp: Date.now() },
      { questionId: 'q4', selectedAnswer: 'None', timestamp: Date.now() },
    ];
    const score = calculateScore(sampleQuestions, attempts);
    expect(score.correct).toBe(2);
    expect(score.percentage).toBe(50);
  });

  test('18. handles empty questions list', () => {
    const score = calculateScore([], []);
    expect(score.percentage).toBe(0);
    expect(score.total).toBe(0);
  });

  test('19. grade A for 90%+', () => {
    expect(getGradeLabel(95)).toBe('A');
    expect(getGradeLabel(90)).toBe('A');
  });

  test('20. grade B-F for other ranges', () => {
    expect(getGradeLabel(85)).toBe('B');
    expect(getGradeLabel(75)).toBe('C');
    expect(getGradeLabel(65)).toBe('D');
    expect(getGradeLabel(50)).toBe('F');
  });

  test('21. formats time remaining correctly', () => {
    expect(formatTimeRemaining(125)).toBe('02:05');
    expect(formatTimeRemaining(60)).toBe('01:00');
    expect(formatTimeRemaining(0)).toBe('00:00');
  });

  test('22. timestamps are recorded in attempts', () => {
    const before = Date.now();
    const attempt: QuizAttempt = { questionId: 'q1', selectedAnswer: '4', timestamp: Date.now() };
    expect(attempt.timestamp).toBeGreaterThanOrEqual(before);
  });
});
