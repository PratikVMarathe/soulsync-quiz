import { describe, expect, it } from 'vitest';
import { normalizeQuiz } from './normalizeQuiz';

describe('normalizeQuiz', () => {
  it('returns null if quizData is null or undefined', () => {
    expect(normalizeQuiz(null)).toBeNull();
    expect(normalizeQuiz(undefined)).toBeNull();
  });

  it('normalizes basic quiz metadata and formats estimated time from seconds', () => {
    const rawQuiz = {
      id: 'quiz-1',
      slug: 'bhagavad-gita-intro',
      title: 'Concept 1: Bhagavad Gita Intro',
      description: 'Test your knowledge on Chapter 1.',
      estimatedTime: '120',
      level: 'Beginner',
      questions: [
        {
          id: 'q1',
          prompt: 'What is Krishna teaching?',
          options: ['Yoga', 'Nothing', 'History', 'Math'],
          correctAnswer: 0,
          time: 30,
        },
      ],
    };

    const result = normalizeQuiz(rawQuiz);
    expect(result.id).toBe('quiz-1');
    expect(result.slug).toBe('bhagavad-gita-intro');
    expect(result.title).toBe('Concept 1: Bhagavad Gita Intro');
    expect(result.introTitle).toBe('Bhagavad Gita Intro'); // Strips Concept N: prefix
    expect(result.estimatedTime).toBe('2 mins');
    expect(result.totalQuestions).toBe(1);
    expect(result.questions[0].prompt).toBe('What is Krishna teaching?');
    expect(result.questions[0].options).toHaveLength(4);
    expect(result.questions[0].timeRemainingSeconds).toBe(30);
  });

  it('handles string time formatting in questions (e.g., "45s", "1 min")', () => {
    const rawQuiz = {
      title: 'Time Test',
      questions: [
        { id: 'q1', prompt: 'Q1', time: '45s', options: ['A', 'B'] },
        { id: 'q2', prompt: 'Q2', time: '1 min', options: ['A', 'B'] },
      ],
    };

    const result = normalizeQuiz(rawQuiz);
    expect(result.questions[0].timeRemainingSeconds).toBe(45);
    expect(result.questions[1].timeRemainingSeconds).toBe(60);
    // Total duration = 105s -> 2 mins estimated time
    expect(result.estimatedTime).toBe('2 mins');
  });

  it('extracts wisdom citation from references or tips', () => {
    const rawQuiz = {
      questions: [
        {
          id: 'q1',
          prompt: 'Q1',
          references: [{ source: 'Bhagavad Gita', chapter: 2, verse: 13, text: 'Soul transcends body' }],
        },
        {
          id: 'q2',
          prompt: 'Q2',
          tips: 'As stated in Bhagavad Gita (2.20), soul is unborn.',
        },
      ],
    };

    const result = normalizeQuiz(rawQuiz);
    expect(result.questions[0].wisdom.citation).toBe('Bhagavad Gita 2.13');
    expect(result.questions[0].wisdom.translation).toBe('Soul transcends body');
    expect(result.questions[1].wisdom.citation).toBe('Bhagavad Gita 2.20');
  });

  it('normalizes string options into objects with default percentages', () => {
    const rawQuiz = {
      questions: [
        { id: 'q1', options: ['Opt A', 'Opt B', 'Opt C', 'Opt D'] },
      ],
    };

    const result = normalizeQuiz(rawQuiz);
    expect(result.questions[0].options).toEqual([
      { text: 'Opt A', percentage: 72 },
      { text: 'Opt B', percentage: 12 },
      { text: 'Opt C', percentage: 8 },
      { text: 'Opt D', percentage: 8 },
    ]);
  });

  it('falls back to previewQuiz question if questions array is empty or missing in input', () => {
    const rawQuiz = { title: 'Empty Quiz' };
    const result = normalizeQuiz(rawQuiz);
    expect(result.questions.length).toBe(1); // falls back to previewQuiz fallbackQuestion
    expect(result.totalQuestions).toBe(1);
  });

  it('does not produce references or citation if question has no reference fields', () => {
    const rawQuiz = {
      questions: [
        {
          id: 'q-no-ref',
          prompt: 'General Knowledge Question',
          options: ['A', 'B', 'C', 'D'],
          references: [],
        },
        {
          id: 'q-empty-ref',
          prompt: 'Another Question',
          options: ['A', 'B', 'C', 'D'],
          references: [{ source: '', chapter: '', verse: '', text: '' }],
        },
      ],
    };

    const result = normalizeQuiz(rawQuiz);
    expect(result.questions[0].references).toEqual([]);
    expect(result.questions[0].wisdom.citation).toBe('');
    expect(result.questions[1].references).toEqual([]);
    expect(result.questions[1].wisdom.citation).toBe('');
  });
});
