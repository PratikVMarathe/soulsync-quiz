import { describe, expect, it } from 'vitest';
import {
  ATTEMPT_STATUSES,
  buildAttemptAnswers,
  calculateQuizResult,
  createInitialAnswerState,
  formatAnswersForFirestore,
  formatAttemptDuration,
  getDeviceMetadata,
  getElapsedSeconds,
  setAnswerAtIndex,
} from './quizAttempt';

describe('quizAttempt utilities', () => {
  describe('createInitialAnswerState', () => {
    it('creates an array of initial answer objects with null selectedIndex and default runtime state', () => {
      const state = createInitialAnswerState(3);
      expect(state).toHaveLength(3);
      expect(state).toEqual([
        { answeredAt: null, isRevealed: false, questionId: 'q1', remainingSeconds: 30, selectedIndex: null, timeTaken: 0, visited: true },
        { answeredAt: null, isRevealed: false, questionId: 'q2', remainingSeconds: 30, selectedIndex: null, timeTaken: 0, visited: false },
        { answeredAt: null, isRevealed: false, questionId: 'q3', remainingSeconds: 30, selectedIndex: null, timeTaken: 0, visited: false },
      ]);
    });
  });

  describe('getElapsedSeconds', () => {
    it('returns 0 if startedAtMs is not provided or falsy', () => {
      expect(getElapsedSeconds(null)).toBe(0);
      expect(getElapsedSeconds(0)).toBe(0);
    });

    it('calculates elapsed seconds from startedAtMs timestamp', () => {
      const fiveSecondsAgo = Date.now() - 5000;
      const elapsed = getElapsedSeconds(fiveSecondsAgo);
      expect(elapsed).toBeGreaterThanOrEqual(5);
      expect(elapsed).toBeLessThan(7); // within test execution timing bounds
    });
  });

  describe('setAnswerAtIndex', () => {
    it('updates the answer object at the target index immutably', () => {
      const initial = createInitialAnswerState(2);
      const updated = setAnswerAtIndex(initial, 1, { remainingSeconds: 15, selectedIndex: 2, timeTaken: 15 });
      expect(updated[0]).toEqual({ answeredAt: null, isRevealed: false, questionId: 'q1', remainingSeconds: 30, selectedIndex: null, timeTaken: 0, visited: true });
      expect(updated[1]).toEqual({ answeredAt: null, isRevealed: false, questionId: 'q2', remainingSeconds: 15, selectedIndex: 2, timeTaken: 15, visited: false });
      expect(initial[1]).toEqual({ answeredAt: null, isRevealed: false, questionId: 'q2', remainingSeconds: 30, selectedIndex: null, timeTaken: 0, visited: false });
    });
  });

  describe('buildAttemptAnswers', () => {
    const mockQuestions = [
      { id: 'q1', correctAnswer: 1, timeRemainingSeconds: 30 },
      { id: 'q2', correctAnswer: 2, timeRemainingSeconds: 30 },
      { id: 'q3', correctAnswer: 0, timeRemainingSeconds: 30 },
    ];

    it('builds full answer list with correctness checking and remaining seconds calculation', () => {
      const answers = [
        { answeredAt: 1690000000000, isRevealed: true, remainingSeconds: 20, selectedIndex: 1, timeTaken: 10, visited: true },
        { answeredAt: 1690000005000, isRevealed: true, remainingSeconds: 25, selectedIndex: 0, timeTaken: 5, visited: false },
        { answeredAt: null, isRevealed: false, selectedIndex: null, timeTaken: 0, visited: true },
      ];

      const result = buildAttemptAnswers({
        answers,
        currentElapsedSeconds: 12,
        currentQuestionIndex: 2,
        questions: mockQuestions,
      });

      expect(result[0]).toEqual({
        answeredAt: 1690000000000,
        correctIndex: 1,
        isCorrect: true,
        isRevealed: true,
        questionId: 'q1',
        remainingSeconds: 20,
        selectedIndex: 1,
        timeTaken: 10,
        visited: true,
      });
      expect(result[1]).toEqual({
        answeredAt: 1690000005000,
        correctIndex: 2,
        isCorrect: false,
        isRevealed: true,
        questionId: 'q2',
        remainingSeconds: 25,
        selectedIndex: 0,
        timeTaken: 5,
        visited: false,
      });
      expect(result[2]).toEqual({
        answeredAt: null,
        correctIndex: 0,
        isCorrect: false,
        isRevealed: false,
        questionId: 'q3',
        remainingSeconds: 18, // 30 - (0 + 12)
        selectedIndex: null,
        timeTaken: 12,
        visited: true,
      });
    });
  });

  describe('calculateQuizResult', () => {
    it('calculates correct, wrong, skipped counts and score percentage accurately', () => {
      const attemptAnswers = [
        { isCorrect: true, selectedIndex: 0, timeTaken: 10 },
        { isCorrect: true, selectedIndex: 1, timeTaken: 15 },
        { isCorrect: false, selectedIndex: 2, timeTaken: 8 },
        { isCorrect: false, selectedIndex: null, timeTaken: 0 }, // skipped
      ];

      const result = calculateQuizResult({ attemptAnswers, totalTimeTaken: 33 });
      expect(result.totalQuestions).toBe(4);
      expect(result.correctAnswers).toBe(2);
      expect(result.wrongAnswers).toBe(1);
      expect(result.skippedAnswers).toBe(1);
      expect(result.percentage).toBe(50); // 2/4 = 50%
      expect(result.score).toBe(2);
      expect(result.totalTimeTaken).toBe(33);
      expect(result.status).toBe(ATTEMPT_STATUSES.COMPLETED);
    });

    it('handles empty questions list without division by zero errors', () => {
      const result = calculateQuizResult({ attemptAnswers: [], totalTimeTaken: 0 });
      expect(result.percentage).toBe(0);
      expect(result.totalQuestions).toBe(0);
    });
  });

  describe('formatAttemptDuration', () => {
    it('formats duration purely in seconds if under 60 seconds', () => {
      expect(formatAttemptDuration(45)).toBe('45s');
      expect(formatAttemptDuration(0)).toBe('0s');
    });

    it('formats duration into minutes and padded seconds if 60 seconds or more', () => {
      expect(formatAttemptDuration(60)).toBe('1m 00s');
      expect(formatAttemptDuration(125)).toBe('2m 05s');
      expect(formatAttemptDuration(75)).toBe('1m 15s');
    });

    it('handles negative or invalid input gracefully', () => {
      expect(formatAttemptDuration(-10)).toBe('0s');
      expect(formatAttemptDuration(null)).toBe('0s');
      expect(formatAttemptDuration(undefined)).toBe('0s');
    });
  });

  describe('formatAnswersForFirestore', () => {
    it('strips evaluation properties like correctIndex and isCorrect while preserving runtime data', () => {
      const evaluatedAnswers = [
        { answeredAt: 12345, correctIndex: 1, isCorrect: true, isRevealed: true, questionId: 'q1', remainingSeconds: 20, selectedIndex: 1, timeTaken: 10, visited: true },
      ];
      const result = formatAnswersForFirestore(evaluatedAnswers);
      expect(result).toEqual([
        { answeredAt: 12345, isRevealed: true, questionId: 'q1', remainingSeconds: 20, selectedIndex: 1, timeTaken: 10, visited: true },
      ]);
    });
  });

  describe('getDeviceMetadata', () => {
    it('generates a web device metadata payload', () => {
      const metadata = getDeviceMetadata();
      expect(metadata.platform).toBe('WEB');
      expect(['DESKTOP', 'MOBILE', 'TABLET']).toContain(metadata.viewport);
      expect(metadata.browser).toBeDefined();
    });
  });
});
