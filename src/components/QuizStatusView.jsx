export default function QuizStatusView({
  actions = [],
  isEmbedded = false,
  state,
}) {
  return (
    <div className={`quiz-state-screen${isEmbedded ? ' is-embedded' : ''}`}>
      <div className="quiz-status-card" role="alert">
        <span className="quiz-status-code">{state?.statusCode || 500}</span>
        <strong>{state?.title || 'Quiz Error'}</strong>
        <span className="quiz-status-message">{state?.message || 'Something went wrong while loading this concept.'}</span>

        {actions.length ? (
          <div className="quiz-status-actions">
            {actions.map((action) => (
              <button
                className={action.tone === 'secondary' ? 'quiz-status-button is-secondary' : 'quiz-status-button'}
                key={action.label}
                onClick={action.onClick}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
