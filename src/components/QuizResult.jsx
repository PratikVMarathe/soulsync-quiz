import Icon from './Icon';
import { formatAttemptDuration } from '../utils/quizAttempt';

function formatReference(reference) {
  if (!reference?.source) return '';

  const location = reference.chapter && reference.verse
    ? ` ${reference.chapter}.${reference.verse}`
    : '';

  return `${reference.source}${location}`;
}

export default function QuizResult({
  onReturn,
  quiz,
  result,
}) {
  return (
    <main className="quiz-result-main">
      <section className="quiz-result-card">
        <div className="quiz-result-hero">
          <span className="quiz-question-badge">
            <Icon name="spark" size={18} />
            Result
          </span>
          <h1>{quiz.introTitle}</h1>
          <p>Your Quiz is complete. Review the answers, and references below.</p>
        </div>

        <div className="quiz-result-score-grid">
          <article>
            <span>Score</span>
            <strong>{result.score}/{result.totalQuestions}</strong>
          </article>
          <article>
            <span>Percentage</span>
            <strong>{result.percentage}%</strong>
          </article>
          <article>
            <span>Correct</span>
            <strong>{result.correctAnswers}</strong>
          </article>
          <article>
            <span>Wrong</span>
            <strong>{result.wrongAnswers}</strong>
          </article>
          <article>
            <span>Skipped</span>
            <strong>{result.skippedAnswers}</strong>
          </article>
          <article>
            <span>Total Time</span>
            <strong>{formatAttemptDuration(result.totalTimeTaken)}</strong>
          </article>
        </div>

        <div className="quiz-result-review">
          <h2>Question Review</h2>

          {quiz.questions.map((question, index) => {
            const answer = result.answers[index];
            const selectedOption = answer.selectedIndex === null
              ? 'Skipped'
              : question.options[answer.selectedIndex]?.text || 'Unknown answer';
            const correctOption = question.options[question.correctAnswer]?.text || 'Not set';

            return (
              <article className="quiz-review-item" key={question.id || question.prompt}>
                <div className="quiz-review-heading">
                  <span className={`quiz-review-status${answer.isCorrect ? ' is-correct' : answer.selectedIndex === null ? ' is-skipped' : ' is-wrong'}`}>
                    {answer.isCorrect ? 'Correct' : answer.selectedIndex === null ? 'Skipped' : 'Wrong'}
                  </span>
                  <small>{formatAttemptDuration(answer.timeTaken)}</small>
                </div>

                <h3>{index + 1}. {question.prompt}</h3>
                <p><strong>Your answer:</strong> {selectedOption}</p>
                <p><strong>Correct answer:</strong> {correctOption}</p>

                {/* {question.insight ? (
                  <div className="quiz-insight is-result">
                    <Icon name="spark" size={24} />
                    <p><strong>Tip:</strong> {question.insight}</p>
                  </div>
                ) : null} */}

                {question.references?.length ? (
                  <div className="quiz-reference-list">
                    <strong>References</strong>
                    {question.references.map((reference, referenceIndex) => (
                      <p key={`${question.id}-reference-${referenceIndex}`}>
                        {formatReference(reference)}
                        {reference.text ? `: ${reference.text}` : ''}
                      </p>
                    ))}
                  </div>
                ) : question.wisdom?.citation ? (
                  <div className="quiz-reference-list">
                    <strong>References</strong>
                    <p>{question.wisdom.citation}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <button className="quiz-result-return" onClick={onReturn} type="button">
          <span>Continue Your Journey</span>
          <Icon name="arrow" size={20} />
        </button>
      </section>
    </main>
  );
}
