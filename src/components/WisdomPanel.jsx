import Icon from './Icon';

export default function WisdomPanel({ question }) {
  const { wisdom } = question;

  return (
    <section className="quiz-wisdom-panel">
      <div className="quiz-panel-heading">
        <Icon name="book" size={21} />
        <h2>{wisdom.title}</h2>
      </div>

      {wisdom.verse && <p className="quiz-verse">{wisdom.verse}</p>}
      <p className="quiz-translation">{wisdom.translation}</p>
      <p className="quiz-citation">&mdash; {wisdom.citation}</p>

      <div className="quiz-community">
        <div className="quiz-panel-heading">
          <Icon name="users" size={21} />
          <h2>What others think</h2>
        </div>
        <p><strong>{question.options[question.correctAnswer]?.percentage || 0}%</strong> chose this answer</p>

        <div className="quiz-community-results">
          {question.options.map((option, index) => (
            <div className="quiz-community-result" key={option.text}>
              <span className={`quiz-community-index${index === question.correctAnswer ? ' is-correct' : ''}`}>
                {index + 1}
              </span>
              <span className="quiz-community-label">{option.text}</span>
              <span className="quiz-community-bar"><i style={{ width: `${option.percentage}%` }} /></span>
              <strong>{option.percentage}%</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
