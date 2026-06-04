export const DEFAULT_VISUAL_KEY = 'focus-lake';

export const quizVisuals = {
  'focus-lake': {
    label: 'Focus Lake',
    tone: 'Calm focus',
    colors: ['#f4d98f', '#8eb69b', '#244f43'],
    symbol: 'lotus',
  },
  'mindfulness-breath': {
    label: 'Mindfulness Breath',
    tone: 'Present awareness',
    colors: ['#d8efe7', '#82b9a1', '#25594a'],
    symbol: 'breath',
  },
  'anger-fire': {
    label: 'Anger Awareness',
    tone: 'Transforming anger',
    colors: ['#f7c17f', '#dd7b64', '#5a302e'],
    symbol: 'flame',
  },
  'calm-lotus': {
    label: 'Calm Lotus',
    tone: 'Inner calm',
    colors: ['#f6e7ce', '#a7c598', '#2d654e'],
    symbol: 'lotus',
  },
  'discipline-path': {
    label: 'Discipline Path',
    tone: 'Daily practice',
    colors: ['#ecd9aa', '#9aa981', '#394c35'],
    symbol: 'path',
  },
  'purpose-mountain': {
    label: 'Purpose Mountain',
    tone: 'Clear purpose',
    colors: ['#f2cf8b', '#88a9a1', '#263f4d'],
    symbol: 'mountain',
  },
  'detachment-sky': {
    label: 'Detachment Sky',
    tone: 'Letting go',
    colors: ['#d9eaf0', '#9ab4c0', '#3e5961'],
    symbol: 'cloud',
  },
  'gratitude-sunrise': {
    label: 'Gratitude Sunrise',
    tone: 'Gratitude',
    colors: ['#ffe3a7', '#d8a85c', '#6a4b2d'],
    symbol: 'sun',
  },
  'compassion-hands': {
    label: 'Compassion Hands',
    tone: 'Compassion',
    colors: ['#f2d8c7', '#c99882', '#5a3e35'],
    symbol: 'heart',
  },
  'resilience-tree': {
    label: 'Resilience Tree',
    tone: 'Resilience',
    colors: ['#d7e7ca', '#7fa06d', '#2f563a'],
    symbol: 'tree',
  },
  'clarity-moon': {
    label: 'Clarity Moon',
    tone: 'Mental clarity',
    colors: ['#d7e2ee', '#8c9eb6', '#25364f'],
    symbol: 'moon',
  },
  'balance-scales': {
    label: 'Balance Scales',
    tone: 'Equanimity',
    colors: ['#f0dfba', '#91a98f', '#334c42'],
    symbol: 'balance',
  },
  'devotion-temple': {
    label: 'Devotion Temple',
    tone: 'Devotion',
    colors: ['#f2d89b', '#9ea16d', '#4c4630'],
    symbol: 'temple',
  },
  'wisdom-book': {
    label: 'Wisdom Book',
    tone: 'Wisdom',
    colors: ['#efe5cf', '#9aa687', '#344639'],
    symbol: 'book',
  },
  'courage-flame': {
    label: 'Courage Flame',
    tone: 'Courage',
    colors: ['#ffd48d', '#d47855', '#573530'],
    symbol: 'flame',
  },
};

const visualKeywordMap = [
  ['anger', 'anger-fire'],
  ['calm', 'calm-lotus'],
  ['clarity', 'clarity-moon'],
  ['compassion', 'compassion-hands'],
  ['courage', 'courage-flame'],
  ['detachment', 'detachment-sky'],
  ['discipline', 'discipline-path'],
  ['focus', 'focus-lake'],
  ['gratitude', 'gratitude-sunrise'],
  ['mindfulness', 'mindfulness-breath'],
  ['purpose', 'purpose-mountain'],
  ['resilience', 'resilience-tree'],
  ['wisdom', 'wisdom-book'],
  ['devotion', 'devotion-temple'],
  ['balance', 'balance-scales'],
];

export const getDefaultHeroImageUrl = () => (
  new URL('/images/concept-focus-meditation.jpg', import.meta.url).href
);

export const getVisualKey = (value) => {
  if (!value) return DEFAULT_VISUAL_KEY;

  const normalizedValue = String(value).toLowerCase();
  if (quizVisuals[normalizedValue]) return normalizedValue;

  return visualKeywordMap.find(([keyword]) => normalizedValue.includes(keyword))?.[1]
    || DEFAULT_VISUAL_KEY;
};

export const getQuizVisual = (key) => quizVisuals[key] || quizVisuals[DEFAULT_VISUAL_KEY];
