import Icon from './Icon';

const getOptionClassName = ({ answerIndex, correctAnswer, isRevealed, isTimeExpired, selectedAnswer }) => {
  const isLocked = isRevealed || isTimeExpired;
  if (isLocked) {
    if (answerIndex === correctAnswer) return ' is-correct';
    if (selectedAnswer !== null && answerIndex === selectedAnswer) return ' is-incorrect';
    return '';
  }

  return answerIndex === selectedAnswer ? ' is-selected' : '';
};

export default function QuestionCard({
  isRevealed = false,
  isSubmitting = false,
  isTimeExpired = false,
  onCheckAnswer,
  onNext,
  onSelectAnswer,
  question,
  selectedAnswer,
}) {
  const isLocked = isRevealed || isTimeExpired;
  const disableOptions = isLocked || isSubmitting;

  return (
    <article className="quiz-question-card">
      <div className="quiz-question-badge">
        <Icon name="lotus" size={18} />
        <span>{question.eyebrow}</span>
      </div>

      <h1>{question.prompt}</h1>
      <p className="quiz-question-helper">
        {isLocked
          ? selectedAnswer === null
            ? 'Time has expired — marked as skipped. Here is the correct answer'
            : selectedAnswer === question.correctAnswer
              ? 'Correct answer!'
              : 'Here is the correct answer'
          : 'Choose the best answer'}
      </p>

      <div className="quiz-options">
        {question.options.map((option, index) => {
          const optionClassName = getOptionClassName({
            answerIndex: index,
            correctAnswer: question.correctAnswer,
            isRevealed,
            isTimeExpired,
            selectedAnswer,
          });
          return (
            <button
              className={`quiz-option${optionClassName}`}
              disabled={disableOptions}
              key={option.text}
              onClick={() => onSelectAnswer(index)}
              type="button"
            >
              <span className="quiz-option-number">{index + 1}</span>
              <span className="quiz-option-label">{option.text}</span>
              {optionClassName === ' is-correct' && (
                <span className="quiz-option-feedback"><Icon name="check" size={21} /></span>
              )}
              {optionClassName === ' is-incorrect' && (
                <span className="quiz-option-feedback"><Icon name="close" size={21} /></span>
              )}
            </button>
          );
        })}
      </div>

      {isTimeExpired && selectedAnswer === null ? (
        <div className="quiz-insight is-result">
          <Icon name="timer" size={29} />
          <div>
            <p><strong>Time Expired:</strong> No answer was selected in time (marked as skipped). The correct answer is highlighted in green above.</p>
          </div>
        </div>
      ) : null}

      {isLocked && question.insight ? (
        <div className="quiz-insight">
          <Icon name="spark" size={29} />
          <p><strong>Insight:</strong> {question.insight}</p>
        </div>
      ) : null}

      <div className="quiz-runtime-actions">
        {!isLocked ? (
          <button
            className="quiz-next-button"
            disabled={selectedAnswer === null || isSubmitting}
            onClick={onCheckAnswer}
            type="button"
          >
            <span>Check Answer</span>
            <Icon name="spark" size={20} />
          </button>
        ) : (
          <button
            className="quiz-next-button"
            disabled={isSubmitting}
            onClick={onNext}
            type="button"
          >
            <span>{isSubmitting ? 'Submitting...' : 'Next'}</span>
            <Icon name="arrow" size={20} />
          </button>
        )}
      </div>
    </article>
  );
}
