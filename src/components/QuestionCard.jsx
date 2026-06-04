import Icon from './Icon';

const getOptionClassName = (answerIndex, correctAnswer, selectedAnswer) => {
  if (selectedAnswer === null) return '';
  if (answerIndex === correctAnswer) return ' is-correct';
  if (answerIndex === selectedAnswer) return ' is-incorrect';
  return '';
};

export default function QuestionCard({ question, selectedAnswer, onSelectAnswer, onNext }) {
  const hasAnswered = selectedAnswer !== null;

  return (
    <article className="quiz-question-card">
      <div className="quiz-question-badge">
        <Icon name="lotus" size={18} />
        <span>{question.eyebrow}</span>
      </div>

      <h1>{question.prompt}</h1>
      <p className="quiz-question-helper">
        {hasAnswered ? 'Here is the best answer' : 'Choose the best answer'}
      </p>

      <div className="quiz-options">
        {question.options.map((option, index) => {
          const optionClassName = getOptionClassName(index, question.correctAnswer, selectedAnswer);
          return (
            <button
              className={`quiz-option${optionClassName}`}
              disabled={hasAnswered}
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

      {hasAnswered && (
        <>
          <div className="quiz-insight">
            <Icon name="spark" size={29} />
            <p><strong>Insight:</strong> {question.insight}</p>
          </div>
          <div className="quiz-next-wrap">
            <button className="quiz-next-button" onClick={onNext} type="button">
              <span>Next Concept</span>
              <Icon name="arrow" size={22} />
            </button>
            <Icon className="quiz-button-spark" name="spark" size={28} />
          </div>
        </>
      )}
    </article>
  );
}
