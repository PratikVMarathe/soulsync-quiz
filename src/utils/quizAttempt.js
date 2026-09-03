export const ATTEMPT_STATUSES = {
  ABANDONED: 'ABANDONED',
  COMPLETED: 'COMPLETED',
  IN_PROGRESS: 'IN_PROGRESS',
};

export function createInitialAnswerState(questionsOrCount) {
  const isArray = Array.isArray(questionsOrCount);
  const totalQuestions = isArray ? questionsOrCount.length : Number(questionsOrCount) || 0;

  return Array.from({ length: totalQuestions }, (_, index) => {
    const question = isArray ? questionsOrCount[index] : null;
    return {
      answeredAt: null,
      isRevealed: false,
      questionId: question?.id || `q${index + 1}`,
      remainingSeconds: Number(question?.timeRemainingSeconds ?? 30),
      selectedIndex: null,
      timeTaken: 0,
      visited: index === 0,
    };
  });
}

export function getElapsedSeconds(startedAtMs) {
  if (!startedAtMs) return 0;
  return Math.max(0, Math.round((Date.now() - startedAtMs) / 1000));
}

export function setAnswerAtIndex(answers, questionIndex, nextAnswer) {
  return answers.map((answer, index) => (
    index === questionIndex
      ? { ...answer, ...nextAnswer }
      : answer
  ));
}

export function buildAttemptAnswers({ answers, currentElapsedSeconds = 0, currentQuestionIndex, questions }) {
  return questions.map((question, index) => {
    const answer = answers[index] || {};
    const selectedIndex = Number.isInteger(answer.selectedIndex) ? answer.selectedIndex : null;
    const isCurrentQuestion = index === currentQuestionIndex;
    const baseTimeTaken = Number(answer.timeTaken) || 0;
    const timeTaken = baseTimeTaken + (isCurrentQuestion ? currentElapsedSeconds : 0);
    const defaultRemaining = Number(question.timeRemainingSeconds ?? 30);
    const remainingSeconds = Number.isInteger(answer.remainingSeconds) ? answer.remainingSeconds : Math.max(0, defaultRemaining - timeTaken);

    return {
      answeredAt: answer.answeredAt ?? null,
      correctIndex: question.correctAnswer,
      isCorrect: selectedIndex !== null && selectedIndex === question.correctAnswer,
      isRevealed: Boolean(answer.isRevealed ?? (selectedIndex !== null)),
      questionId: question.id || `q${index + 1}`,
      remainingSeconds,
      selectedIndex,
      timeTaken,
      visited: Boolean(answer.visited || isCurrentQuestion || index === 0),
    };
  });
}

export function formatAnswersForFirestore(answers = []) {
  return answers.map((answer, index) => ({
    answeredAt: answer.answeredAt ?? null,
    isRevealed: Boolean(answer.isRevealed ?? (answer.selectedIndex !== null)),
    questionId: answer.questionId || `q${index + 1}`,
    remainingSeconds: Number(answer.remainingSeconds ?? 0),
    selectedIndex: Number.isInteger(answer.selectedIndex) ? answer.selectedIndex : null,
    timeTaken: Number(answer.timeTaken) || 0,
    visited: Boolean(answer.visited ?? false),
  }));
}

export function getDeviceMetadata() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  let viewport = 'DESKTOP';
  if (width <= 768) {
    viewport = 'MOBILE';
  } else if (width <= 1024) {
    viewport = 'TABLET';
  }

  let browser = 'Unknown';
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else browser = 'Other';
  }

  return {
    browser,
    platform: 'WEB',
    viewport,
  };
}


export function calculateQuizResult({ attemptAnswers, totalTimeTaken }) {
  const totalQuestions = attemptAnswers.length;
  const correctAnswers = attemptAnswers.filter((answer) => answer.isCorrect).length;
  const skippedAnswers = attemptAnswers.filter((answer) => answer.selectedIndex === null).length;
  const wrongAnswers = totalQuestions - correctAnswers - skippedAnswers;
  const percentage = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return {
    answers: attemptAnswers,
    correctAnswers,
    percentage,
    score: correctAnswers,
    skippedAnswers,
    status: ATTEMPT_STATUSES.COMPLETED,
    totalQuestions,
    totalTimeTaken,
    wrongAnswers,
  };
}

export function formatAttemptDuration(seconds) {
  const totalSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (!minutes) return `${remainingSeconds}s`;
  return `${minutes}m ${String(remainingSeconds).padStart(2, '0')}s`;
}
