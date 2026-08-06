import Icon from './Icon';
import QuizIntroVisual from './QuizIntroVisual';

const introSteps = [
  { label: 'Intro', icon: 'play', isActive: true },
  { label: 'Questions', icon: 'message' },
  { label: 'Reflection', icon: 'spark' },
];

export default function QuizIntro({
  activeAttempt = null,
  hasCompleted = false,
  isEmbedded = false,
  onExit,
  onStart,
  quiz,
  starting = false,
}) {
  const isRetakeDisabled = !activeAttempt && hasCompleted && quiz.allowRetake === false;
  const isResume = Boolean(activeAttempt);

  let buttonLabel = starting ? 'Starting...' : 'Start Quiz';
  if (isResume) {
    buttonLabel = starting ? 'Resuming...' : 'Resume Quiz';
  } else if (isRetakeDisabled) {
    buttonLabel = 'Completed';
  }

  const restoredQuestionNumber = (activeAttempt?.runtime?.currentQuestionIndex ?? activeAttempt?.currentQuestionIndex ?? 0) + 1;

  return (
    <div className={`quiz-intro-screen${isEmbedded ? ' is-embedded' : ''}`}>
      {!isEmbedded && (
        <header className="quiz-intro-header">
          <a aria-label="SoulSync home" className="quiz-brand" href="/">
            <Icon name="lotus" size={36} />
            <span>SoulSync</span>
          </a>

          <div aria-label="Quiz progress" className="quiz-intro-steps">
            {introSteps.map((step, index) => (
              <div className={`quiz-intro-step${step.isActive ? ' is-active' : ''}`} key={step.label}>
                <span><Icon name={step.icon} size={14} /></span>
                <small>{step.label}</small>
                {index < introSteps.length - 1 && <i />}
              </div>
            ))}
          </div>

          <button className="quiz-exit-button" onClick={onExit} type="button">
            <Icon name="close" size={18} />
            <span>Exit Quiz</span>
          </button>
        </header>
      )}

      <main className={`quiz-intro-main${isEmbedded ? ' is-embedded' : ''}`}>
        <article className="quiz-intro-card">
          <div className="quiz-intro-art">
            <QuizIntroVisual
              alt={quiz.heroAlt}
              imageUrl={quiz.heroImage}
              visualKey={quiz.visualKey}
            />
          </div>

          <div className="quiz-intro-content">
            <div className="quiz-intro-badge">
              <Icon name="lotus" size={17} />
              <span>Concept Quiz</span>
            </div>

            <h1>{quiz.introTitle}</h1>

            <div className="quiz-intro-divider">
              <span />
              <Icon name="lotus" size={22} />
              <span />
            </div>

            <p className="quiz-intro-description">{quiz.description}</p>

            <div className="quiz-intro-facts">
              <div>
                <Icon name="question" size={23} />
                <strong>{quiz.totalQuestions}</strong>
                <small>Questions</small>
              </div>
              <div>
                <Icon name="timer" size={23} />
                <strong>{quiz.estimatedTime}</strong>
                <small>Estimated Time</small>
              </div>
              <div>
                <Icon name="levels" size={23} />
                <strong>{quiz.level}</strong>
                <small>Level</small>
              </div>
            </div>

            <div className="quiz-intro-note">
              <Icon name="bulb" size={25} />
              <p>
                {isResume ? (
                  `You have an active quiz attempt saved. Resume directly from Question ${restoredQuestionNumber}.`
                ) : isRetakeDisabled ? (
                  'You have already completed this quiz. Retakes are currently disabled for this concept.'
                ) : (
                  'Take a deep breath. This short quiz will help you reflect and grow.'
                )}
              </p>
            </div>

            <div className="quiz-intro-start-wrap">
              <button
                className="quiz-intro-start"
                disabled={starting || isRetakeDisabled}
                onClick={onStart}
                type="button"
              >
                <span>{buttonLabel}</span>
                <Icon name={isRetakeDisabled ? 'check' : 'arrow'} size={21} />
              </button>
              <Icon className="quiz-intro-spark" name="spark" size={24} />
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

