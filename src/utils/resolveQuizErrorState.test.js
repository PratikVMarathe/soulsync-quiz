import { describe, expect, it } from 'vitest';
import { resolveQuizErrorState } from './resolveQuizErrorState';

describe('resolveQuizErrorState', () => {
  it('respects explicit statusCode or status on the error object', () => {
    expect(resolveQuizErrorState({ statusCode: 404 }).statusCode).toBe(404);
    expect(resolveQuizErrorState({ status: 403 }).statusCode).toBe(403);
  });

  it('maps standard Firestore error codes to corresponding HTTP status presets', () => {
    expect(resolveQuizErrorState({ code: 'permission-denied' }).statusCode).toBe(403);
    expect(resolveQuizErrorState({ code: 'not-found' }).statusCode).toBe(404);
    expect(resolveQuizErrorState({ code: 'deadline-exceeded' }).statusCode).toBe(408);
    expect(resolveQuizErrorState({ code: 'unavailable' }).statusCode).toBe(503);
  });

  it('maps custom messages to corresponding HTTP status presets', () => {
    expect(
      resolveQuizErrorState({ message: 'Your sign-in session is not available right now' }).statusCode,
    ).toBe(401);
    expect(
      resolveQuizErrorState({ message: 'This concept does not exist anymore' }).statusCode,
    ).toBe(404);
    expect(resolveQuizErrorState({ message: 'Failed to fetch network data' }).statusCode).toBe(503);
    expect(
      resolveQuizErrorState({ message: 'importing a module script failed during setup' }).statusCode,
    ).toBe(502);
  });

  it('returns default 500 Quiz Error preset when error is unrecognized or null', () => {
    const nullRes = resolveQuizErrorState(null);
    expect(nullRes.statusCode).toBe(500);
    expect(nullRes.title).toBe('Quiz Error');
    expect(nullRes.message).toBe('Something unexpected happened while preparing this concept.');

    const genericRes = resolveQuizErrorState({ code: 'unknown-fault' });
    expect(genericRes.statusCode).toBe(500);
    expect(genericRes.title).toBe('Quiz Error');

    const unlistedRes = resolveQuizErrorState({ statusCode: 599 });
    expect(unlistedRes.message).toBe('Something went wrong while loading this concept.');
  });

  it('allows overriding statusCode, title, and message', () => {
    const custom = resolveQuizErrorState(
      { code: 'permission-denied' },
      { title: 'Custom Title', message: 'Custom Message', statusCode: 401 },
    );
    expect(custom.statusCode).toBe(401);
    expect(custom.title).toBe('Custom Title');
    expect(custom.message).toBe('Custom Message');
  });

  it('returns explicit preset messages when error has no custom message property', () => {
    const res = resolveQuizErrorState({ code: 'not-found' });
    expect(res.title).toBe('Concept Not Found');
    expect(res.message).toBe('This concept does not exist or may have been removed.');
  });
});
