import { previewQuiz } from '../data/previewQuiz';
import { getDefaultHeroImageUrl, getVisualKey } from '../data/quizVisuals';

const fallbackQuestion = previewQuiz.questions[0];
const defaultPercentages = [72, 12, 8, 8];
const defaultWisdom = {
  title: 'Wisdom from the Gita',
  verse: '',
  translation: '',
  citation: 'Bhagavad Gita',
};

const parseDurationSeconds = (value, fallbackSeconds = 30) => {
  if (Number.isFinite(Number(value))) return Number(value);
  if (typeof value !== 'string') return fallbackSeconds;

  const durationMatch = value.trim().match(/^(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes)?$/i);
  if (!durationMatch) return fallbackSeconds;

  const duration = Number(durationMatch[1]);
  return /^m|min|mins|minute|minutes$/i.test(durationMatch[2] || '') ? duration * 60 : duration;
};

const formatEstimatedTime = (seconds) => {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
};

const getIntroTitle = (title) => title?.replace(/^concept\s*\d+\s*:\s*/i, '').trim();

const getWisdomCitation = (question) => {
  const tips = question.tips || '';
  const directCitation = tips.match(/Bhagavad Gita\s*\((\d+\.\d+)\)/i);
  if (directCitation) return `Bhagavad Gita ${directCitation[1]}`;

  const chapterCitation = tips.match(/Chapter\s*(\d+),?\s*Verse\s*(\d+)/i);
  if (chapterCitation) return `Bhagavad Gita ${chapterCitation[1]}.${chapterCitation[2]}`;

  return defaultWisdom.citation;
};

const normalizeOption = (option, index) => {
  if (typeof option === 'string') {
    return { text: option, percentage: defaultPercentages[index] || 0 };
  }

  return {
    text: option?.text || option?.label || `Option ${index + 1}`,
    percentage: Number(option?.percentage ?? option?.percent ?? defaultPercentages[index] ?? 0),
  };
};

const normalizeQuestion = (question = {}) => {
  const options = question.options?.length
    ? question.options.map(normalizeOption)
    : fallbackQuestion.options;

  return {
    prompt: question.prompt || question.question || question.text || question.title || fallbackQuestion.prompt,
    eyebrow: question.eyebrow || 'Wisdom Check',
    options,
    correctAnswer: Number(
      question.correctAnswer ?? question.correctIndex ?? question.answerIndex ?? 0,
    ),
    insight: question.insight || question.tips || fallbackQuestion.insight,
    timeRemainingSeconds: parseDurationSeconds(question.time, 30),
    wisdom: {
      ...defaultWisdom,
      translation: question.tips || defaultWisdom.translation,
      citation: getWisdomCitation(question),
      ...(question.wisdom || {}),
    },
  };
};

export const normalizeQuiz = (quizData) => {
  if (!quizData) return null;

  const sourceQuestions = quizData.questions?.length
    ? quizData.questions
    : fallbackQuestion
      ? [fallbackQuestion]
      : [];

  const questions = sourceQuestions.map(normalizeQuestion);

  if (!questions.length) return null;

  const totalDurationSeconds = questions.reduce(
    (duration, question) => duration + question.timeRemainingSeconds,
    0,
  );
  const estimatedTime = quizData.time || formatEstimatedTime(totalDurationSeconds);
  const adminImageUrl = quizData.imageUrl
    || quizData.heroImage
    || quizData.heroImageUrl
    || quizData.introImageUrl
    || quizData.introVisual?.url;
  const explicitVisualKey = quizData.visualKey
    || quizData.heroVisualKey
    || quizData.introVisual?.key;
  const visualKey = getVisualKey(
    explicitVisualKey
      || quizData.category
      || quizData.title,
  );
  const shouldUseSvg = !adminImageUrl && (
    quizData.visualType === 'svg'
      || quizData.introVisual?.type === 'svg'
      || Boolean(explicitVisualKey)
      || visualKey !== 'focus-lake'
  );

  return {
    title: quizData.title || previewQuiz.title,
    introTitle: quizData.introTitle || getIntroTitle(quizData.title) || previewQuiz.introTitle,
    description: quizData.description || previewQuiz.description,
    estimatedTime,
    heroImage: shouldUseSvg ? null : adminImageUrl || getDefaultHeroImageUrl(),
    heroAlt: quizData.heroAlt || quizData.imageAlt || quizData.introVisual?.alt || 'A peaceful meditation scene for the concept quiz',
    visualKey,
    level: quizData.level || 'Beginner',
    totalQuestions: questions.length,
    questions,
  };
};
