import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { previewQuiz } from './data/previewQuiz';
import { normalizeQuiz } from './utils/normalizeQuiz';
import AiGuideCard from './components/AiGuideCard';
import ProgressHeader from './components/ProgressHeader';
import QuizResult from './components/QuizResult';
import QuizStatusView from './components/QuizStatusView';
import QuestionCard from './components/QuestionCard';
import QuizIntro from './components/QuizIntro';
import QuizHistory from './components/QuizHistory';
import QuizSidebar from './components/QuizSidebar';
import QuizTopbar from './components/QuizTopbar';
import TimerCard from './components/TimerCard';
import { resolveQuizErrorState } from './utils/resolveQuizErrorState';
import {
  completeQuizAttempt,
  createQuizAttempt,
  loadActiveQuizAttempt,
  loadUserQuizAttempts,
  updateQuizAttemptRuntime,
} from './services/quizAttemptService';
import {
  buildAttemptAnswers,
  calculateQuizResult,
  createInitialAnswerState,
  setAnswerAtIndex,
} from './utils/quizAttempt';
import { loadActiveQuizBySlug } from './services/quizLoaderService';
import { DEFAULT_BACKGROUND_VOLUME, QUIZ_MUSIC } from './constants/audio';
import { playCorrectSound, playWrongSound } from './utils/audio';
import './index.css';

export default function App({
  user,
  quizId,
  onExit,
  onBack,
  onComplete,
  onReturn,
  isEmbedded = false,
}) {
  const isPreview = !quizId;
  const [quizData, setQuizData] = useState(isPreview ? previewQuiz : null);
  const [loading, setLoading] = useState(!isPreview);
  const [error, setError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [startingAttempt, setStartingAttempt] = useState(false);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);
  const [attemptId, setAttemptId] = useState('');
  const [existingActiveAttempt, setExistingActiveAttempt] = useState(null);
  const [hasCompletedAttempt, setHasCompletedAttempt] = useState(false);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [answerState, setAnswerState] = useState([]);
  const [result, setResult] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const initialViewMode = searchParams.get('view') || 'quiz';
  const [viewMode, setViewMode] = useState(initialViewMode);

  const saveTimeoutRef = useRef(null);
  const bgMusicRef = useRef(null);

  useEffect(() => {
    if (!quizId) return undefined;

    let ignoreResult = false;

    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);

      try {
        const quizDocument = await loadActiveQuizBySlug(quizId);
        let activeAttempt = null;
        let isCompleted = false;

        if (!isPreview && user?.uid) {
          activeAttempt = await loadActiveQuizAttempt({ quizSlug: quizId, userId: user.uid });
          if (!activeAttempt) {
            const userAttempts = await loadUserQuizAttempts(user.uid);
            isCompleted = (userAttempts[quizId]?.completedAttempts?.length > 0);
          }
        }

        if (!ignoreResult) {
          setQuizData(quizDocument);
          setExistingActiveAttempt(activeAttempt);
          setHasCompletedAttempt(isCompleted);
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
  }, [quizId, reloadToken, user?.uid, isPreview]);

  const isPlaying = hasStarted && !result && !loading && !error && viewMode === 'quiz';

  useEffect(() => {
    if (isPlaying) {
      document.body.classList.add('soulsync-quiz-active');
    } else {
      document.body.classList.remove('soulsync-quiz-active');
    }

    return () => {
      document.body.classList.remove('soulsync-quiz-active');
    };
  }, [isPlaying]);

  // Background music lifecycle management
  useEffect(() => {
    if (!hasStarted || result || submittingAttempt || viewMode !== 'quiz') {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.src = '';
        bgMusicRef.current = null;
      }
      return undefined;
    }

    const slug = quizData?.slug || quizId;
    const musicSrc = slug ? QUIZ_MUSIC[slug] : null;

    if (!musicSrc) {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.src = '';
        bgMusicRef.current = null;
      }
      return undefined;
    }

    if (bgMusicRef.current && bgMusicRef.current.getAttribute('data-src') === musicSrc) {
      if (bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch(() => { });
      }
      return undefined;
    }

    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.src = '';
      bgMusicRef.current = null;
    }

    try {
      const audio = new Audio(musicSrc);
      audio.volume = DEFAULT_BACKGROUND_VOLUME;
      audio.loop = true;
      audio.setAttribute('data-src', musicSrc);
      bgMusicRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy prevented playback, ignore safely
        });
      }

      audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        audio.play().catch(() => { });
      });
    } catch {
      // Audio optional
    }

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.src = '';
        bgMusicRef.current = null;
      }
    };
  }, [hasStarted, quizData?.slug, quizId, result, submittingAttempt, viewMode]);

  const quiz = useMemo(() => normalizeQuiz(quizData), [quizData]);
  const question = quiz?.questions[questionIndex];
  const currentAnswer = answerState[questionIndex];
  const selectedAnswer = currentAnswer?.selectedIndex ?? null;
  const isAnswerRevealed = Boolean(currentAnswer?.isRevealed);
  const isTimeExpired = (currentAnswer?.remainingSeconds <= 0);

  const performSave = useCallback(async (customAnswers, customIndex, customRemaining, isResumeCall = false) => {
    if (isPreview || !attemptId || !user?.uid || result || submittingAttempt) return;

    const answersToSave = customAnswers || answerState;
    const indexToSave = customIndex !== undefined ? customIndex : questionIndex;
    const currentAns = answersToSave[indexToSave];
    const remaining = customRemaining !== undefined ? customRemaining : (currentAns?.remainingSeconds ?? 0);

    try {
      await updateQuizAttemptRuntime({
        answers: answersToSave,
        attemptId,
        currentQuestionIndex: indexToSave,
        isResume: isResumeCall,
        remainingSeconds: remaining,
        totalTimeTaken,
        userId: user.uid,
      });
    } catch (err) {
      console.error('Failed to auto-save runtime:', err);
    }
  }, [answerState, attemptId, isPreview, questionIndex, result, submittingAttempt, totalTimeTaken, user]);

  useEffect(() => {
    if (!hasStarted || result || submittingAttempt || isPreview || !attemptId) return undefined;
    const intervalId = setInterval(() => {
      performSave();
    }, 15000);
    return () => clearInterval(intervalId);
  }, [attemptId, hasStarted, isPreview, performSave, result, submittingAttempt]);

  useEffect(() => {
    if (!hasStarted || result || submittingAttempt) return undefined;

    const handleVisibility = () => {
      const isHidden = document.visibilityState === 'hidden' || document.hidden;
      setIsPaused(isHidden);
      if (isHidden) performSave();
    };
    const handleUnload = () => performSave();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [hasStarted, performSave, result, submittingAttempt]);

  // Timer countdown and expiration handling
  useEffect(() => {
    if (!hasStarted || result || submittingAttempt || isPaused || !quiz) return undefined;

    const intervalId = setInterval(() => {
      setAnswerState((currentAnswers) => {
        const currentAns = currentAnswers[questionIndex];
        if (!currentAns || isAnswerRevealed || currentAns.remainingSeconds <= 0) return currentAnswers;

        const nextRemaining = Math.max(0, currentAns.remainingSeconds - 1);
        const shouldExpire = nextRemaining <= 0;

        if (shouldExpire) {
          const currentSelection = currentAns.selectedIndex;
          const isCorrect = currentSelection !== null && currentSelection === question?.correctAnswer;
          if (isCorrect) {
            playCorrectSound();
          } else {
            playWrongSound();
          }
        }

        const updated = setAnswerAtIndex(currentAnswers, questionIndex, {
          isRevealed: shouldExpire ? true : Boolean(currentAns.isRevealed),
          remainingSeconds: nextRemaining,
          timeTaken: (currentAns.timeTaken || 0) + 1,
        });

        if (shouldExpire) {
          performSave(updated, questionIndex, 0);
        }

        return updated;
      });
      setTotalTimeTaken((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [hasStarted, isAnswerRevealed, isPaused, performSave, question?.correctAnswer, questionIndex, quiz, result, submittingAttempt]);

  const handleSelectAnswer = useCallback((answerIndex) => {
    if (result || submittingAttempt || isAnswerRevealed || isTimeExpired) return;

    const isCorrect = (answerIndex === question?.correctAnswer);
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    setAnswerState((currentAnswers) => {
      const updated = setAnswerAtIndex(currentAnswers, questionIndex, {
        answeredAt: Date.now(),
        isRevealed: true,
        selectedIndex: answerIndex,
        visited: true,
      });

      performSave(updated, questionIndex);
      return updated;
    });
  }, [isAnswerRevealed, isTimeExpired, performSave, question?.correctAnswer, questionIndex, result, submittingAttempt]);

  useEffect(() => {
    if (!hasStarted || result || !question) return undefined;

    const handleKeyboardAnswer = (event) => {
      const keyNumber = Number(event.key);
      const answerIndex = keyNumber - 1;
      if (answerIndex >= 0 && answerIndex < question.options.length) {
        if (!isAnswerRevealed && !isTimeExpired) {
          handleSelectAnswer(answerIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyboardAnswer);
    return () => window.removeEventListener('keydown', handleKeyboardAnswer);
  }, [handleSelectAnswer, hasStarted, isAnswerRevealed, isTimeExpired, question, result]);

  const handleStartQuiz = async () => {
    if (!quiz) return;

    setStartingAttempt(true);
    setError(null);

    try {
      if (existingActiveAttempt) {
        const restoredIndex = existingActiveAttempt.runtime?.currentQuestionIndex ?? existingActiveAttempt.currentQuestionIndex ?? 0;
        const restoredAnswers = existingActiveAttempt.answers?.length
          ? existingActiveAttempt.answers
          : createInitialAnswerState(quiz.questions);

        const normalizedAnswers = quiz.questions.map((q, idx) => {
          const saved = restoredAnswers[idx] || {};
          const hasSavedSelection = Number.isInteger(saved.selectedIndex);
          return {
            answeredAt: saved.answeredAt ?? null,
            isRevealed: Boolean(saved.isRevealed || hasSavedSelection),
            questionId: q.id || `q${idx + 1}`,
            remainingSeconds: Number.isInteger(saved.remainingSeconds) ? saved.remainingSeconds : Number(q.timeRemainingSeconds ?? 30),
            selectedIndex: hasSavedSelection ? saved.selectedIndex : null,
            timeTaken: Number(saved.timeTaken) || 0,
            visited: Boolean(saved.visited || idx === restoredIndex),
          };
        });

        setAttemptId(existingActiveAttempt.id);
        setAnswerState(normalizedAnswers);
        setQuestionIndex(restoredIndex);
        setTotalTimeTaken(existingActiveAttempt.totalTimeTaken || 0);
        setHasStarted(true);

        if (!isPreview && user?.uid) {
          updateQuizAttemptRuntime({
            answers: normalizedAnswers,
            attemptId: existingActiveAttempt.id,
            currentQuestionIndex: restoredIndex,
            isResume: true,
            remainingSeconds: normalizedAnswers[restoredIndex]?.remainingSeconds ?? 30,
            totalTimeTaken: existingActiveAttempt.totalTimeTaken || 0,
            userId: user.uid,
          }).catch((e) => console.error('Error recording resume event:', e));
        }
      } else {
        const initialAnswers = createInitialAnswerState(quiz.questions);
        const nextAttemptId = (!isPreview && user?.uid) ? await createQuizAttempt({ quiz, user }) : '';

        setAttemptId(nextAttemptId);
        setAnswerState(initialAnswers);
        setQuestionIndex(0);
        setTotalTimeTaken(0);
        setResult(null);
        setHasStarted(true);
      }
    } catch (startError) {
      console.error('Failed to start quiz attempt:', startError);
      setError(resolveQuizErrorState(startError, startError.code === 'permission-denied'
        ? {
          message: 'Firestore blocked creating your quiz attempt. Check rules for users/{uid}/quizAttempts.',
          statusCode: 403,
          title: 'Attempt Access Restricted',
        }
        : {
          message: startError.message || 'We could not start this quiz attempt right now. Please try again.',
          title: 'Could Not Start Quiz',
        }));
    } finally {
      setStartingAttempt(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!quiz || submittingAttempt) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const attemptAnswers = buildAttemptAnswers({
      answers: answerState,
      currentElapsedSeconds: 0,
      currentQuestionIndex: questionIndex,
      questions: quiz.questions,
    });
    const nextResult = calculateQuizResult({
      attemptAnswers,
      totalTimeTaken,
    });

    setSubmittingAttempt(true);
    setError(null);

    try {
      if (!isPreview && user?.uid && attemptId) {
        await completeQuizAttempt({
          attemptId,
          currentQuestionIndex: questionIndex,
          quizSlug: quiz.slug,
          result: nextResult,
          user,
        });
      }

      setAnswerState(attemptAnswers.map((answer) => ({
        answeredAt: answer.answeredAt,
        isRevealed: true,
        remainingSeconds: answer.remainingSeconds,
        selectedIndex: answer.selectedIndex,
        timeTaken: answer.timeTaken,
        visited: true,
      })));
      setResult(nextResult);
      setExistingActiveAttempt(null);
      setHasCompletedAttempt(true);
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
  }, [answerState, attemptId, isPreview, questionIndex, quiz, submittingAttempt, totalTimeTaken, user]);

  const handleNext = useCallback(() => {
    if (!quiz || submittingAttempt) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    if (questionIndex >= quiz.totalQuestions - 1) {
      handleSubmit();
      return;
    }

    const nextIndex = questionIndex + 1;
    setAnswerState((current) => {
      const updated = setAnswerAtIndex(current, nextIndex, { visited: true });
      performSave(updated, nextIndex);
      return updated;
    });
    setQuestionIndex(nextIndex);
  }, [handleSubmit, performSave, questionIndex, quiz, submittingAttempt]);

  const handleBack = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    performSave();

    if (onBack) {
      onBack();
      return;
    }

    if (onExit) {
      onExit();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
    }
  };

  const handleReturn = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    performSave();

    if (onComplete) {
      onComplete();
      return;
    }

    if (onReturn) {
      onReturn();
      return;
    }

    if (onExit) {
      onExit();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
    }
  };

  const handleShowQuiz = () => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }

    setViewMode('quiz');
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
          { label: 'Go Back', onClick: handleBack, tone: 'secondary' },
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
          { label: 'Go Back', onClick: handleBack, tone: 'secondary' },
        ]}
        isEmbedded={isEmbedded}
        state={resolveQuizErrorState({
          message: 'This concept could not be prepared because its data is incomplete.',
          statusCode: 500,
        })}
      />
    );
  }

  if (viewMode === 'history') {
    return (
      <div className={`quiz-app${isEmbedded ? ' is-embedded' : ''}`}>
        {!isEmbedded && <QuizTopbar user={user} onExit={handleBack} />}
        {!isEmbedded && <QuizSidebar />}
        <QuizHistory
          onExit={handleBack}
          onGoToQuiz={handleShowQuiz}
          onRetake={handleShowQuiz}
          quiz={quiz}
          user={user}
        />
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <QuizIntro
        activeAttempt={existingActiveAttempt}
        hasCompleted={hasCompletedAttempt}
        isEmbedded={isEmbedded}
        quiz={quiz}
        onExit={handleBack}
        onStart={handleStartQuiz}
        starting={startingAttempt}
      />
    );
  }

  if (result) {
    return (
      <div className={`quiz-app${isEmbedded ? ' is-embedded' : ''}`}>
        {!isEmbedded && <QuizTopbar user={user} onExit={handleBack} />}
        {!isEmbedded && <QuizSidebar />}

        <QuizResult onReturn={handleReturn} quiz={quiz} result={result} />
      </div>
    );
  }

  return (
    <div className={`quiz-app${isPlaying ? ' is-playing' : ''}${isEmbedded ? ' is-embedded' : ''}`}>
      {!isEmbedded && <QuizTopbar user={user} onExit={handleBack} />}
      {!isEmbedded && <QuizSidebar />}

      <main className={`quiz-main${isEmbedded ? ' is-embedded' : ''}`}>
        <section className="quiz-workspace">
          <div className="quiz-primary-column">
            <ProgressHeader
              currentQuestion={questionIndex + 1}
              totalQuestions={quiz.totalQuestions}
            />
            <QuestionCard
              isRevealed={isAnswerRevealed}
              isSubmitting={submittingAttempt}
              isTimeExpired={isTimeExpired}
              onNext={handleNext}
              onSelectAnswer={handleSelectAnswer}
              question={question}
              selectedAnswer={selectedAnswer}
            />
            {submittingAttempt ? (
              <div className="quiz-submit-state">Saving your result...</div>
            ) : null}
          </div>

          <aside aria-label="Quiz support" className="quiz-support-column">
            <TimerCard seconds={answerState[questionIndex]?.remainingSeconds ?? 0} />
            {/* <AiGuideCard /> */}
          </aside>
        </section>
      </main>
    </div>
  );
}
