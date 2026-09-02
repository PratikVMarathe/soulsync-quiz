import { previewQuiz } from '../data/previewQuiz';
import { getDefaultHeroImageUrl, getVisualKey } from '../data/quizVisuals';

const fallbackQuestion = previewQuiz.questions[0];
const defaultPercentages = [72, 12, 8, 8];
const defaultWisdom = {
  title: '',
  verse: '',
  translation: '',
  citation: '',
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

export const getQuestionReferences = (question = {}) => {
  const references = question.references ?? question.reference ?? [];
  const rawList = Array.isArray(references) ? references.filter(Boolean) : references ? [references] : [];

  return rawList
    .map((ref) => {
      if (typeof ref === 'string') {
        const trimmed = ref.trim();
        return trimmed ? { chapter: null, source: trimmed, text: '', verse: null } : null;
      }
      const source = String(ref.source || ref.referenceSource || '').trim();
      const chapter = ref.chapter !== undefined && ref.chapter !== null && ref.chapter !== ''
        ? Number(ref.chapter)
        : ref.referenceChapter !== undefined && ref.referenceChapter !== null && ref.referenceChapter !== ''
          ? Number(ref.referenceChapter)
          : null;
      const verse = ref.verse !== undefined && ref.verse !== null && ref.verse !== ''
        ? Number(ref.verse)
        : ref.referenceVerse !== undefined && ref.referenceVerse !== null && ref.referenceVerse !== ''
          ? Number(ref.referenceVerse)
          : null;
      const text = String(ref.text || ref.referenceText || '').trim();

      const validChapter = Number.isFinite(chapter) && chapter > 0 ? chapter : null;
      const validVerse = Number.isFinite(verse) && verse > 0 ? verse : null;

      if (!source && !validChapter && !validVerse && !text) return null;

      return {
        chapter: validChapter,
        source,
        text,
        verse: validVerse,
      };
    })
    .filter(Boolean);
};

const getWisdomCitation = (question) => {
  const primaryReference = getQuestionReferences(question)[0];

  if (primaryReference) {
    const source = primaryReference.source || '';
    const chapterVerse = primaryReference.chapter && primaryReference.verse
      ? ` ${primaryReference.chapter}.${primaryReference.verse}`
      : primaryReference.chapter
        ? ` Chapter ${primaryReference.chapter}`
        : primaryReference.verse
          ? ` Verse ${primaryReference.verse}`
          : '';

    const combined = `${source}${chapterVerse}`.trim();
    if (combined) return combined;
    if (primaryReference.text) return primaryReference.text;
  }

  const tips = question.tips || '';
  const directCitation = tips.match(/Bhagavad Gita\s*\((\d+\.\d+)\)/i);
  if (directCitation) return `Bhagavad Gita ${directCitation[1]}`;

  const chapterCitation = tips.match(/Chapter\s*(\d+),?\s*Verse\s*(\d+)/i);
  if (chapterCitation) return `Bhagavad Gita ${chapterCitation[1]}.${chapterCitation[2]}`;

  return '';
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
  const references = getQuestionReferences(question);
  const primaryReference = references[0];
  const insight = question.explanation
    || question.tips
    || primaryReference?.text
    || fallbackQuestion.insight;
  const citation = getWisdomCitation(question);
  const translation = question.tips || question.explanation || primaryReference?.text || question.wisdom?.translation || '';

  return {
    id: question.id || question.questionId || question.text || question.prompt || question.title || fallbackQuestion.prompt,
    prompt: question.prompt || question.question || question.text || question.title || fallbackQuestion.prompt,
    eyebrow: question.eyebrow || 'Wisdom Check',
    options,
    correctAnswer: Number(
      question.correctAnswer ?? question.correctIndex ?? question.answerIndex ?? 0,
    ),
    insight,
    references,
    timeRemainingSeconds: parseDurationSeconds(question.time, 30),
    wisdom: {
      title: question.wisdom?.title || (citation || translation ? 'Wisdom' : ''),
      verse: question.wisdom?.verse || '',
      translation,
      citation,
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
  const estimatedTime = quizData.timeLimitLabel
    || quizData.time
    || (Number(quizData.estimatedTime) ? formatEstimatedTime(Number(quizData.estimatedTime)) : null)
    || formatEstimatedTime(totalDurationSeconds);
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
    id: quizData.id || '',
    slug: quizData.slug || '',
    title: quizData.title || previewQuiz.title,
    introTitle: quizData.introTitle || getIntroTitle(quizData.title) || previewQuiz.introTitle,
    description: quizData.description || previewQuiz.description,
    estimatedTime,
    heroImage: shouldUseSvg ? null : adminImageUrl || getDefaultHeroImageUrl(),
    heroAlt: quizData.heroAlt || quizData.imageAlt || quizData.introVisual?.alt || 'A peaceful meditation scene for the concept quiz',
    visualKey,
    level: quizData.level || 'Beginner',
    totalQuestions: questions.length,
    allowRetake: quizData.allowRetake ?? true,
    questions,
  };
};
