import { useEffect, useMemo, useState } from 'react';
import { previewQuiz } from './data/previewQuiz';
import { normalizeQuiz } from './utils/normalizeQuiz';
import AiGuideCard from './components/AiGuideCard';
import ProgressHeader from './components/ProgressHeader';
import QuizStatusView from './components/QuizStatusView';
import QuestionCard from './components/QuestionCard';
import QuizIntro from './components/QuizIntro';
import QuizSidebar from './components/QuizSidebar';
import QuizTopbar from './components/QuizTopbar';
import TimerCard from './components/TimerCard';
import WisdomPanel from './components/WisdomPanel';
import { resolveQuizErrorState } from './utils/resolveQuizErrorState';
import './index.css';

export default function App({ user, quizId, onExit, isEmbedded = false }) {
  const isPreview = !quizId;
  const [quizData, setQuizData] = useState(isPreview ? previewQuiz : null);
  const [loading, setLoading] = useState(!isPreview);
  const [error, setError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!quizId) return undefined;

    let ignoreResult = false;

    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);

      try {
        const [{ doc, getDoc }, { auth, db }] = await Promise.all([
          import('firebase/firestore'),
          import('./config/firebase'),
        ]);
        await auth.authStateReady();

        if (!auth.currentUser) {
          throw new Error('Your sign-in session is not available in the quiz app. Please sign in again.');
        }

        const quizSnapshot = await getDoc(doc(db, 'quizzes', quizId));

        if (!quizSnapshot.exists()) {
          throw new Error('This concept does not exist or was removed.');
        }

        if (!ignoreResult) {
          setQuizData(quizSnapshot.data());
          setHasStarted(false);
          setQuestionIndex(0);
          setSelectedAnswer(null);
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
  const question = quiz?.questions[questionIndex % quiz.questions.length];

  useEffect(() => {
    if (!hasStarted || selectedAnswer !== null || !question) return undefined;

    const handleKeyboardAnswer = (event) => {
      const answerIndex = Number(event.key) - 1;
      if (answerIndex >= 0 && answerIndex < question.options.length) {
        setSelectedAnswer(answerIndex);
      }
    };

    window.addEventListener('keydown', handleKeyboardAnswer);
    return () => window.removeEventListener('keydown', handleKeyboardAnswer);
  }, [hasStarted, question, selectedAnswer]);

  const handleNext = () => {
    setQuestionIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      return nextIndex >= quiz.totalQuestions ? 0 : nextIndex;
    });
    setSelectedAnswer(null);
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
        onStart={() => setHasStarted(true)}
      />
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
              question={question}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={setSelectedAnswer}
              onNext={handleNext}
            />
          </div>

          <aside className="quiz-support-column" aria-label="Quiz support">
            <TimerCard
              initialSeconds={question.timeRemainingSeconds}
              key={questionIndex}
            />
            <WisdomPanel question={question} />
            <AiGuideCard />
          </aside>
        </section>
      </main>
    </div>
  );
}
