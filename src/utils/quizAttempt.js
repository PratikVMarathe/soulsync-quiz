export const ATTEMPT_STATUSES = {
  ABANDONED: 'ABANDONED',
  COMPLETED: 'COMPLETED',
  IN_PROGRESS: 'IN_PROGRESS',
};

export function createInitialAnswerState(totalQuestions) {
  return Array.from({ length: totalQuestions }, () => ({
    selectedIndex: null,
    timeTaken: 0,
  }));
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

    return {
      correctIndex: question.correctAnswer,
      isCorrect: selectedIndex !== null && selectedIndex === question.correctAnswer,
      questionId: question.id || `q${index + 1}`,
      selectedIndex,
      timeTaken,
    };
  });
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
