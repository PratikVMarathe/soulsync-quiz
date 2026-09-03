import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_BACKGROUND_VOLUME, DEFAULT_EFFECTS_VOLUME, QUIZ_MUSIC, QUIZ_SOUNDS } from '../constants/audio';
import { playCorrectSound, playSoundEffect, playWrongSound } from './audio';

describe('Audio Constants and Utilities', () => {
  it('maps the 9 quiz slugs to background music files', () => {
    const requiredSlugs = [
      'bhagavad-gita',
      'festivals-of-india',
      'guess-the-character',
      'guess-the-story',
      'indian-culture-and-traditions',
      'lord-krishna',
      'mahabharata',
      'ramayana',
      'spiritual-wisdom-for-daily-life',
    ];

    requiredSlugs.forEach((slug) => {
      expect(QUIZ_MUSIC[slug]).toBeDefined();
      expect(QUIZ_MUSIC[slug]).toMatch(/^\/music\/.*\.mpeg$/);
    });
  });

  it('defines correct and wrong sound effects with expected audio file paths', () => {
    expect(QUIZ_SOUNDS.correct).toBe('/sounds/correct.mpeg');
    expect(QUIZ_SOUNDS.wrong).toBe('/sounds/wrong.mpeg');
    expect(DEFAULT_BACKGROUND_VOLUME).toBe(0.25);
    expect(DEFAULT_EFFECTS_VOLUME).toBe(0.6);
  });

  it('safely invokes playSoundEffect without throwing when window/Audio is available', () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    globalThis.Audio = vi.fn().mockImplementation(() => ({
      play: playMock,
      volume: 0.6,
    }));

    playCorrectSound();
    expect(globalThis.Audio).toHaveBeenCalledWith('/sounds/correct.mpeg');

    playWrongSound();
    expect(globalThis.Audio).toHaveBeenCalledWith('/sounds/wrong.mpeg');
  });

  it('handles empty sound source gracefully without errors', () => {
    expect(() => playSoundEffect(null)).not.toThrow();
    expect(() => playSoundEffect('')).not.toThrow();
  });
});
