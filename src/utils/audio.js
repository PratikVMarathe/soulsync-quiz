import { DEFAULT_EFFECTS_VOLUME, QUIZ_SOUNDS } from '../constants/audio';

export function playSoundEffect(soundSrc, volume = DEFAULT_EFFECTS_VOLUME) {
  if (!soundSrc || typeof window === 'undefined') return;

  try {
    const audio = new Audio(soundSrc);
    audio.volume = volume;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Silently catch autoplay or loading restriction
      });
    }
  } catch {
    // Audio is optional enhancement
  }
}

export function playCorrectSound(volume) {
  playSoundEffect(QUIZ_SOUNDS.correct, volume);
}

export function playWrongSound(volume) {
  playSoundEffect(QUIZ_SOUNDS.wrong, volume);
}
