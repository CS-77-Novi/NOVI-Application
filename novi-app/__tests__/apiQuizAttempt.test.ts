/**
 * Unit Tests — Quiz Attempt Submission (12 test cases)
 */
interface Question { id: string; options: string[]; correct_answer: string; }
interface Answer { questionId: string; selectedAnswer: string; }
interface GradedResult { questionId: string; isCorrect: boolean; correctAnswer: string; selectedAnswer: string; }

function gradeAnswer(q: Question, sel: string): GradedResult {
  return { questionId: q.id, isCorrect: sel === q.correct_answer, correctAnswer: q.correct_answer, selectedAnswer: sel };
}

function gradeAttempt(qs: Question[], answers: Answer[]) {
  const results = answers.map(a => {
    const q = qs.find(q => q.id === a.questionId);
    if (!q) return { questionId: a.questionId, isCorrect: false, correctAnswer: 'unknown', selectedAnswer: a.selectedAnswer };
    return gradeAnswer(q, a.selectedAnswer);
  });
  const correct = results.filter(r => r.isCorrect).length;
  const total = qs.length;
  return { results, score: correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

function isValidTimestamp(ts: number): boolean {
  const now = Date.now(); return ts <= now && ts >= now - 3600000;
}

function isValidUser(uid: string, aid: string): boolean { return uid === aid && uid.length > 0; }

const qs: Question[] = [
  { id: 'q1', options: ['3','4','5'], correct_answer: '4' },
  { id: 'q2', options: ['London','Paris'], correct_answer: 'London' },
  { id: 'q3', options: ['Earth','Jupiter'], correct_answer: 'Jupiter' },
  { id: 'q4', options: ['80','443'], correct_answer: '80' },
];

describe('Quiz Attempt — Correct Grading', () => {
  test('1. all correct = 100%', () => {
    const r = gradeAttempt(qs, qs.map(q => ({ questionId: q.id, selectedAnswer: q.correct_answer })));
    expect(r.percentage).toBe(100);
  });
  test('2. all wrong = 0%', () => {
    expect(gradeAttempt(qs, qs.map(q => ({ questionId: q.id, selectedAnswer: 'wrong' }))).percentage).toBe(0);
  });
  test('3. single correct graded', () => { expect(gradeAnswer(qs[0], '4').isCorrect).toBe(true); });
  test('4. single wrong graded', () => { expect(gradeAnswer(qs[0], '5').isCorrect).toBe(false); });
});

describe('Quiz Attempt — Partial Credit', () => {
  test('5. 2/4 = 50%', () => {
    const a = [{ questionId:'q1', selectedAnswer:'4' },{ questionId:'q2', selectedAnswer:'Paris' },{ questionId:'q3', selectedAnswer:'Jupiter' },{ questionId:'q4', selectedAnswer:'443' }];
    expect(gradeAttempt(qs, a).percentage).toBe(50);
  });
  test('6. 3/4 = 75%', () => {
    const a = [{ questionId:'q1', selectedAnswer:'4' },{ questionId:'q2', selectedAnswer:'London' },{ questionId:'q3', selectedAnswer:'Jupiter' },{ questionId:'q4', selectedAnswer:'443' }];
    expect(gradeAttempt(qs, a).percentage).toBe(75);
  });
  test('7. unknown question ID handled', () => {
    expect(gradeAttempt(qs, [{ questionId:'none', selectedAnswer:'x' }]).results[0].isCorrect).toBe(false);
  });
});

describe('Quiz Attempt — Timestamps', () => {
  test('8. valid timestamp accepted', () => { expect(isValidTimestamp(Date.now())).toBe(true); });
  test('9. future timestamp rejected', () => { expect(isValidTimestamp(Date.now() + 60000)).toBe(false); });
  test('10. old timestamp rejected', () => { expect(isValidTimestamp(Date.now() - 7200000)).toBe(false); });
});

describe('Quiz Attempt — User Association', () => {
  test('11. matching IDs pass', () => { expect(isValidUser('u1','u1')).toBe(true); });
  test('12. mismatch/empty fails', () => { expect(isValidUser('u1','u2')).toBe(false); expect(isValidUser('','')).toBe(false); });
});
