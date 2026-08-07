import { formatAttemptDuration } from './quizAttempt';

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value?.toDate === 'function') return value.toDate();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toMillis(value) {
  return toDate(value)?.getTime() || 0;
}

export function getAttemptDate(attempt) {
  return attempt?.submittedAt
    || attempt?.completedAt
    || attempt?.updatedAt
    || attempt?.startedAt
    || attempt?.createdAt
    || null;
}

export function getAttemptMillis(attempt) {
  return toMillis(getAttemptDate(attempt));
}

export function formatHistoryDate(value) {
  const date = toDate(value);
  if (!date) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatHistoryTime(value) {
  const date = toDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    hour12: true,
    minute: '2-digit',
  }).format(date).toUpperCase();
}

export function sortAttempts(attempts = [], sort = 'LATEST') {
  const sorted = [...attempts];

  sorted.sort((left, right) => {
    if (sort === 'OLDEST') return getAttemptMillis(left) - getAttemptMillis(right);
    if (sort === 'BEST_SCORE') return (right.percentage || 0) - (left.percentage || 0);
    return getAttemptMillis(right) - getAttemptMillis(left);
  });

  return sorted;
}

export function decorateAttempts(attempts = [], sort = 'LATEST') {
  const chronological = [...attempts].sort((left, right) => getAttemptMillis(left) - getAttemptMillis(right));
  const attemptNumbers = new Map();

  chronological.forEach((attempt, index) => {
    attemptNumbers.set(attempt.id, index + 1);
  });

  const completedAttempts = attempts.filter((attempt) => attempt.status === 'COMPLETED');
  const latestCompletedId = sortAttempts(completedAttempts, 'LATEST')[0]?.id;
  const bestAttemptId = [...completedAttempts].sort((left, right) => {
    const percentageDelta = (right.percentage || 0) - (left.percentage || 0);
    if (percentageDelta) return percentageDelta;
    return (right.score || 0) - (left.score || 0);
  })[0]?.id;

  return sortAttempts(attempts, sort).map((attempt) => ({
    ...attempt,
    attemptNumber: attemptNumbers.get(attempt.id) || 1,
    isFirstAttempt: attemptNumbers.get(attempt.id) === 1,
    isLatestAttempt: attempt.id === latestCompletedId,
    isBestAttempt: attempt.id === bestAttemptId,
  }));
}

export function buildHistorySummary(attempts = [], quiz = {}) {
  const completedAttempts = attempts.filter((attempt) => attempt.status === 'COMPLETED');
  const latestAttempt = sortAttempts(completedAttempts, 'LATEST')[0] || null;
  const bestAttempt = [...completedAttempts].sort((left, right) => {
    const percentageDelta = (right.percentage || 0) - (left.percentage || 0);
    if (percentageDelta) return percentageDelta;
    return (right.score || 0) - (left.score || 0);
  })[0] || null;
  const totalQuestions = latestAttempt?.totalQuestions || quiz.totalQuestions || 0;
  const averageScore = completedAttempts.length
    ? Math.round(completedAttempts.reduce((sum, attempt) => sum + (Number(attempt.percentage) || 0), 0) / completedAttempts.length)
    : 0;

  return {
    averageScore,
    bestAttempt,
    completedAttempts,
    latestAttempt,
    lastAttemptDate: getAttemptDate(latestAttempt || attempts[0]),
    totalAttempts: completedAttempts.length || attempts.length,
    totalQuestions,
  };
}

export function getQuestionReferences(question = {}) {
  const references = question.references ?? question.reference ?? [];
  if (Array.isArray(references)) return references.filter(Boolean);
  return references ? [references] : [];
}

function getOptionText(option) {
  if (typeof option === 'string') return option;
  return option?.text || option?.label || '';
}

export function buildAttemptQuestionReview({ attempt, quiz }) {
  const questions = quiz?.questions || [];
  console.log("Questions", questions);

  return questions.map((question, index) => {
    const answers = attempt?.answers || [];
    const answer = answers[index] || {};
    const correctIndex = Number.isInteger(answer.correctIndex)
      ? answer.correctIndex
      : Number(question.correctAnswer ?? question.correctIndex ?? question.answerIndex ?? 0);
    const selectedIndex = Number.isInteger(answer.selectedIndex) ? answer.selectedIndex : null;
    const isSkipped = selectedIndex === null;
    const isCorrect = !isSkipped && selectedIndex === correctIndex;
    const isWrong = !isSkipped && !isCorrect;
    const references = getQuestionReferences(question);
    // console.log("Questions", questions);
    // console.log("Answer", answer);
    console.log("Correct Index", correctIndex);
    console.log("Selected Index", selectedIndex);
    console.log("Is Skipped", isSkipped);
    console.log("Is Correct", isCorrect);
    console.log("Is Wrong", isWrong);
    console.log("References", references);
    console.log("selectedAnswer", isSkipped ? 'Skipped' : getOptionText(question.options?.[selectedIndex]) || '-');
    return {
      correctAnswer: getOptionText(question.options?.[correctIndex]) || '-',
      isCorrect,
      isSkipped,
      isWrong,
      questionId: question.id || `q${index + 1}`,
      questionText: question.prompt || question.text || `Question ${index + 1}`,
      reference: references[0] || null,
      selectedAnswer: isSkipped ? 'Skipped' : getOptionText(question.options?.[selectedIndex]) || '-',
      status: isCorrect ? 'Correct' : isWrong ? 'Wrong' : 'Skipped',
      timeTaken: isSkipped ? '-' : formatAttemptDuration(answer.timeTaken || 0),
    };
  });
}

export function getScoreTone(percentage = 0) {
  if (percentage >= 90) return 'is-high';
  if (percentage >= 70) return 'is-medium';
  return 'is-low';
}
