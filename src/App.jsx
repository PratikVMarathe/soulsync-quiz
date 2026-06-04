import { useEffect, useMemo, useState } from 'react';
import { previewQuiz } from './data/previewQuiz';
import { normalizeQuiz } from './utils/normalizeQuiz';
import AiGuideCard from './components/AiGuideCard';
import ProgressHeader from './components/ProgressHeader';
import QuestionCard from './components/QuestionCard';
import QuizIntro from './components/QuizIntro';
import QuizSidebar from './components/QuizSidebar';
import QuizTopbar from './components/QuizTopbar';
import TimerCard from './components/TimerCard';
import WisdomPanel from './components/WisdomPanel';
import './index.css';

export default function App({ user, quizId, onExit, isEmbedded = false }) {
  const isPreview = !quizId;
  const [quizData, setQuizData] = useState(isPreview ? previewQuiz : null);
  const [loading, setLoading] = useState(!isPreview);
  const [error, setError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

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
          setError(
            fetchError.code === 'permission-denied'
              ? 'Your account does not have permission to read this concept. Check the Firestore rules for quizzes.'
              : fetchError.message || 'Failed to load this concept.',
          );
        }
      } finally {
        if (!ignoreResult) setLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      ignoreResult = true;
    };
  }, [quizId]);

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

  if (loading || error || !quiz || !question) {
    return (
      <div className={`quiz-state-screen${isEmbedded ? ' is-embedded' : ''}`}>
        {loading && <p>Loading your wisdom check...</p>}
        {error && (
          <div className="quiz-state-error">
            <strong>We could not open this concept.</strong>
            <span>{error}</span>
          </div>
        )}
      </div>
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
