import Icon from './Icon';

const getOptionClassName = ({ answerIndex, correctAnswer, isSubmitted, selectedAnswer }) => {
  if (isSubmitted) {
    if (answerIndex === correctAnswer) return ' is-correct';
    if (answerIndex === selectedAnswer) return ' is-incorrect';
    return '';
  }

  return answerIndex === selectedAnswer ? ' is-selected' : '';
};

export default function QuestionCard({
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  isSubmitted = false,
  isSubmitting = false,
  isTimeExpired = false,
  onNext,
  onPrevious,
  onSelectAnswer,
  onSubmit,
  question,
  selectedAnswer,
}) {
  const hasSelectedAnswer = selectedAnswer !== null;
  const disableOptions = isSubmitted || isTimeExpired;

  return (
    <article className="quiz-question-card">
      <div className="quiz-question-badge">
        <Icon name="lotus" size={18} />
        <span>{question.eyebrow}</span>
      </div>

      <h1>{question.prompt}</h1>
      <p className="quiz-question-helper">
        {isSubmitted ? 'Here is the best answer' : isTimeExpired ? 'Time has expired for this question' : 'Choose the best answer'}
      </p>

      <div className="quiz-options">
        {question.options.map((option, index) => {
          const optionClassName = getOptionClassName({
            answerIndex: index,
            correctAnswer: question.correctAnswer,
            isSubmitted,
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

      {!isSubmitted && isTimeExpired ? (
        <div className="quiz-insight is-result">
          <Icon name="timer" size={29} />
          <div>
            <p><strong>Time Expired:</strong> {selectedAnswer === null ? 'No answer was selected (Marked as Skipped).' : 'Your selected answer is locked.'} Advancing to next screen shortly...</p>
            {question.insight && (
              <p style={{ marginTop: '0.5rem' }}><strong>Reflection:</strong> {question.insight}</p>
            )}
            {question.wisdom?.translation && (
              <p style={{ marginTop: '0.5rem' }}><strong>{question.wisdom.citation || 'Gita Wisdom'}:</strong> {question.wisdom.translation}</p>
            )}
          </div>
        </div>
      ) : null}

      {isSubmitted ? (
        <>
          <div className="quiz-insight">
            <Icon name="spark" size={29} />
            <p><strong>Insight:</strong> {question.insight}</p>
          </div>
        </>
      ) : null}

      {!isSubmitted ? (
        <div className="quiz-runtime-actions">
          <button
            className="quiz-secondary-button"
            disabled={!canGoPrevious}
            onClick={onPrevious}
            type="button"
          >
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              className="quiz-next-button"
              disabled={!canGoNext}
              onClick={onNext}
              type="button"
            >
              <span>{hasSelectedAnswer ? 'Next' : 'Skip'}</span>
              <Icon name="arrow" size={20} />
            </button>
          ) : (
            <button className="quiz-next-button" disabled={isSubmitting} onClick={onSubmit} type="button">
              <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
              <Icon name="arrow" size={20} />
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}

