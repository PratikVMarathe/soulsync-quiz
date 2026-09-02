import Icon from './Icon';
import { formatAttemptDuration } from '../utils/quizAttempt';

function formatReference(reference) {
  if (!reference) return '';

  const source = reference.source || reference.referenceSource || '';
  const chapter = reference.chapter ?? reference.referenceChapter ?? '';
  const verse = reference.verse ?? reference.referenceVerse ?? '';
  const location = chapter && verse
    ? ` ${chapter}.${verse}`
    : chapter
      ? ` Chapter ${chapter}`
      : verse
        ? ` Verse ${verse}`
        : '';

  return `${source}${location}`.trim();
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

            const validReferences = (question.references || [])
              .map((reference) => {
                const refStr = formatReference(reference);
                const textStr = reference?.text || reference?.referenceText || '';
                if (refStr && textStr) return `${refStr}: ${textStr}`;
                return refStr || textStr || '';
              })
              .filter(Boolean);

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

                {validReferences.length > 0 ? (
                  <div className="quiz-reference-list">
                    <strong>References</strong>
                    {validReferences.map((refText, referenceIndex) => (
                      <p key={`${question.id}-reference-${referenceIndex}`}>
                        {refText}
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
