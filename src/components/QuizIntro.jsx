import Icon from './Icon';
import QuizIntroVisual from './QuizIntroVisual';

const introSteps = [
  { label: 'Intro', icon: 'play', isActive: true },
  { label: 'Questions', icon: 'message' },
  { label: 'Reflection', icon: 'spark' },
];

export default function QuizIntro({ quiz, onExit, onStart, isEmbedded = false }) {
  return (
    <div className={`quiz-intro-screen${isEmbedded ? ' is-embedded' : ''}`}>
      {!isEmbedded && (
        <header className="quiz-intro-header">
          <a className="quiz-brand" href="/" aria-label="SoulSync home">
            <Icon name="lotus" size={36} />
            <span>SoulSync</span>
          </a>

          <div className="quiz-intro-steps" aria-label="Quiz progress">
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
              <p>Take a deep breath. This short quiz will help you reflect and grow.</p>
            </div>

            <div className="quiz-intro-start-wrap">
              <button className="quiz-intro-start" onClick={onStart} type="button">
                <span>Start Concept</span>
                <Icon name="arrow" size={21} />
              </button>
              <Icon className="quiz-intro-spark" name="spark" size={24} />
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
