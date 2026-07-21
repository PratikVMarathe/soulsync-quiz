import { useCallback, useEffect, useMemo, useState } from 'react';
import { previewQuiz } from './data/previewQuiz';
import { normalizeQuiz } from './utils/normalizeQuiz';
import AiGuideCard from './components/AiGuideCard';
import ProgressHeader from './components/ProgressHeader';
import QuizResult from './components/QuizResult';
import QuizStatusView from './components/QuizStatusView';
import QuestionCard from './components/QuestionCard';
import QuizIntro from './components/QuizIntro';
import QuizSidebar from './components/QuizSidebar';
import QuizTopbar from './components/QuizTopbar';
import TimerCard from './components/TimerCard';
import { resolveQuizErrorState } from './utils/resolveQuizErrorState';
import { completeQuizAttempt, createQuizAttempt } from './services/quizAttemptService';
import { loadActiveQuizBySlug } from './services/quizLoaderService';
import {
  buildAttemptAnswers,
  calculateQuizResult,
  createInitialAnswerState,
  getElapsedSeconds,
  setAnswerAtIndex,
} from './utils/quizAttempt';
import './index.css';

export default function App({ user, quizId, onExit, isEmbedded = false }) {
  const isPreview = !quizId;
  const [quizData, setQuizData] = useState(isPreview ? previewQuiz : null);
  const [loading, setLoading] = useState(!isPreview);
  const [error, setError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [startingAttempt, setStartingAttempt] = useState(false);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);
  const [attemptId, setAttemptId] = useState('');
  const [attemptStartedAtMs, setAttemptStartedAtMs] = useState(0);
  const [questionStartedAtMs, setQuestionStartedAtMs] = useState(0);
  const [answerState, setAnswerState] = useState([]);
  const [result, setResult] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!quizId) return undefined;

    let ignoreResult = false;

    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);

      try {
        const quizDocument = await loadActiveQuizBySlug(quizId);

        if (!ignoreResult) {
          setQuizData(quizDocument);
          setHasStarted(false);
          setQuestionIndex(0);
          setAttemptId('');
          setAnswerState([]);
          setResult(null);
        }
      } catch (fetchError) {
        console.error('Failed to load quiz:', fetchError);
        if (!ignoreResult) {
          setError(resolveQuizErrorState(fetchError, fetchError.code === 'permission-denied'
            ? {
                message: 'Your account does not have permission to read this concept. Check the Firestore rules for quizzes.',
                statusCode: 403,
                title: 'Concept Access Restricted',
              }
            : undefined));
        }
      } finally {
        if (!ignoreResult) setLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      ignoreResult = true;
    };
  }, [quizId, reloadToken]);

  const quiz = useMemo(() => normalizeQuiz(quizData), [quizData]);
  const question = quiz?.questions[questionIndex];
  const selectedAnswer = answerState[questionIndex]?.selectedIndex ?? null;

  const recordCurrentQuestionTime = useCallback(() => {
    const elapsedSeconds = getElapsedSeconds(questionStartedAtMs);

    setAnswerState((currentAnswers) => setAnswerAtIndex(currentAnswers, questionIndex, {
      timeTaken: (currentAnswers[questionIndex]?.timeTaken || 0) + elapsedSeconds,
    }));
  }, [questionIndex, questionStartedAtMs]);

  const handleSelectAnswer = useCallback((answerIndex) => {
    if (result) return;

    setAnswerState((currentAnswers) => setAnswerAtIndex(currentAnswers, questionIndex, {
      selectedIndex: answerIndex,
    }));
  }, [questionIndex, result]);

  useEffect(() => {
    if (!hasStarted || result || !question) return undefined;

    const handleKeyboardAnswer = (event) => {
      const answerIndex = Number(event.key) - 1;
      if (answerIndex >= 0 && answerIndex < question.options.length) {
        handleSelectAnswer(answerIndex);
      }
    };

    window.addEventListener('keydown', handleKeyboardAnswer);
    return () => window.removeEventListener('keydown', handleKeyboardAnswer);
  }, [handleSelectAnswer, hasStarted, question, result]);

  const handleStartQuiz = async () => {
    if (!quiz) return;

    setStartingAttempt(true);
    setError(null);

    try {
      const nextAttemptId = isPreview ? '' : await createQuizAttempt({ quiz, user });
      const now = Date.now();

      setAttemptId(nextAttemptId);
      setAttemptStartedAtMs(now);
      setQuestionStartedAtMs(now);
      setAnswerState(createInitialAnswerState(quiz.totalQuestions));
      setQuestionIndex(0);
      setResult(null);
      setHasStarted(true);
    } catch (startError) {
      console.error('Failed to start quiz attempt:', startError);
      setError(resolveQuizErrorState(startError, startError.code === 'permission-denied'
        ? {
            message: 'Firestore blocked creating your quiz attempt. Check rules for users/{uid}/quizAttempts.',
            statusCode: 403,
            title: 'Attempt Access Restricted',
          }
        : {
            message: 'We could not start this quiz attempt right now. Please try again.',
            title: 'Could Not Start Quiz',
          }));
    } finally {
      setStartingAttempt(false);
    }
  };

  const handlePrevious = () => {
    if (questionIndex <= 0) return;
    recordCurrentQuestionTime();
    setQuestionStartedAtMs(Date.now());
    setQuestionIndex((currentIndex) => currentIndex - 1);
  };

  const handleNext = () => {
    if (!quiz || questionIndex >= quiz.totalQuestions - 1) return;
    recordCurrentQuestionTime();
    setQuestionStartedAtMs(Date.now());
    setQuestionIndex((currentIndex) => currentIndex + 1);
  };

  const handleSubmit = async () => {
    if (!quiz || submittingAttempt) return;

    const currentElapsedSeconds = getElapsedSeconds(questionStartedAtMs);
    const attemptAnswers = buildAttemptAnswers({
      answers: answerState,
      currentElapsedSeconds,
      currentQuestionIndex: questionIndex,
      questions: quiz.questions,
    });
    const nextResult = calculateQuizResult({
      attemptAnswers,
      totalTimeTaken: getElapsedSeconds(attemptStartedAtMs),
    });

    setSubmittingAttempt(true);
    setError(null);

    try {
      if (!isPreview) {
        await completeQuizAttempt({
          attemptId,
          currentQuestionIndex: questionIndex,
          result: nextResult,
          user,
        });
      }

      setAnswerState(attemptAnswers.map((answer) => ({
        selectedIndex: answer.selectedIndex,
        timeTaken: answer.timeTaken,
      })));
      setResult(nextResult);
    } catch (submitError) {
      console.error('Failed to submit quiz attempt:', submitError);
      setError(resolveQuizErrorState(submitError, submitError.code === 'permission-denied'
        ? {
            message: 'Firestore blocked completing your quiz attempt. Check rules for users/{uid}/quizAttempts.',
            statusCode: 403,
            title: 'Could Not Save Result',
          }
        : {
            message: 'We could not save your quiz result right now. Please try again.',
            title: 'Could Not Submit Quiz',
          }));
    } finally {
      setSubmittingAttempt(false);
    }
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
    }
  };

  if (loading) {
    return (
      <div className={`quiz-state-screen${isEmbedded ? ' is-embedded' : ''}`}>
        <p>Loading your wisdom check...</p>
      </div>
    );
  }

  if (error) {
    return (
      <QuizStatusView
        actions={[
          { label: 'Try Again', onClick: () => setReloadToken((currentToken) => currentToken + 1) },
          { label: 'Go Back', onClick: handleExit, tone: 'secondary' },
        ]}
        isEmbedded={isEmbedded}
        state={error}
      />
    );
  }

  if (!quiz || !question) {
    return (
      <QuizStatusView
        actions={[
          { label: 'Reload', onClick: () => window.location.reload() },
          { label: 'Go Back', onClick: handleExit, tone: 'secondary' },
        ]}
        isEmbedded={isEmbedded}
        state={resolveQuizErrorState({
          message: 'This concept could not be prepared because its data is incomplete.',
          statusCode: 500,
        })}
      />
    );
  }

  if (!hasStarted) {
    return (
      <QuizIntro
        isEmbedded={isEmbedded}
        quiz={quiz}
        user={user}
        onExit={handleExit}
        onStart={handleStartQuiz}
        starting={startingAttempt}
      />
    );
  }

  if (result) {
    return (
      <div className={`quiz-app${isEmbedded ? ' is-embedded' : ''}`}>
        {!isEmbedded && <QuizTopbar user={user} onExit={handleExit} />}
        {!isEmbedded && <QuizSidebar />}

        <QuizResult onReturn={handleExit} quiz={quiz} result={result} />
      </div>
    );
  }

  return (
    <div className={`quiz-app${isEmbedded ? ' is-embedded' : ''}`}>
      {!isEmbedded && <QuizTopbar user={user} onExit={handleExit} />}
      {!isEmbedded && <QuizSidebar />}

      <main className={`quiz-main${isEmbedded ? ' is-embedded' : ''}`}>
        <section className="quiz-workspace">
          <div className="quiz-primary-column">
            <ProgressHeader
              currentQuestion={questionIndex + 1}
              totalQuestions={quiz.totalQuestions}
            />
            <QuestionCard
              canGoNext={questionIndex < quiz.totalQuestions - 1}
              canGoPrevious={questionIndex > 0}
              isLastQuestion={questionIndex === quiz.totalQuestions - 1}
              isSubmitting={submittingAttempt}
              question={question}
              selectedAnswer={selectedAnswer}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSelectAnswer={handleSelectAnswer}
              onSubmit={handleSubmit}
            />
            {submittingAttempt ? (
              <div className="quiz-submit-state">Saving your result...</div>
            ) : null}
          </div>

          <aside className="quiz-support-column" aria-label="Quiz support">
            <TimerCard
              initialSeconds={question.timeRemainingSeconds}
              key={questionIndex}
            />
            <AiGuideCard />
          </aside>
        </section>
      </main>
    </div>
  );
}
