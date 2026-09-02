import { useMemo, useState } from 'react';
import { formatAttemptDuration } from '../utils/quizAttempt';
import {
  buildAttemptQuestionReview,
  formatHistoryDate,
  formatHistoryTime,
  getAttemptDate,
} from '../utils/quizHistory';
import Icon from './Icon';

function getShortAttemptId(attemptId = '') {
  if (!attemptId) return '-';
  if (attemptId.length <= 8) return attemptId;
  return `${attemptId.slice(0, 4)}...${attemptId.slice(-4)}`;
}

function getAttemptTitle(attempt) {
  const number = attempt?.attemptNumber ? `#${attempt.attemptNumber}` : '';
  const latest = attempt?.isLatestAttempt ? ' (Latest)' : '';
  return `Attempt ${number}${latest}`.trim();
}

function QuestionStatus({ item }) {
  return (
    <span className={`quiz-attempt-question-status is-${item.status.toLowerCase()}`}>
      <Icon name={item.isCorrect ? 'check' : item.isWrong ? 'close' : 'timer'} size={14} />
      {item.status}
    </span>
  );
}

function ReferenceCard({ reference }) {
  if (!reference) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const chapterVerse = [
    reference.source,
    reference.chapter ? `Chapter ${reference.chapter}` : '',
    reference.verse ? `Verse ${reference.verse}` : '',
  ].filter(Boolean).join('  -  ');

  const rawText = String(reference.text ?? '').trim();
  const shouldTruncate = rawText.length > 100;
  const visibleText = shouldTruncate && !isExpanded ? `${rawText.slice(0, 100).trimEnd()}...` : rawText;

  return (
    <div className="quiz-attempt-reference-card">
      <span>
        <Icon name="book" size={15} />
        Reference
      </span>
      {chapterVerse ? <strong>{chapterVerse}</strong> : null}
      {rawText ? (
        <p>
          {visibleText}
          {shouldTruncate ? (
            <button className="quiz-attempt-view-verse" onClick={() => setIsExpanded((value) => !value)} type="button">
              {isExpanded ? 'Hide Verse' : 'View Verse'}
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export default function QuizAttemptDetails({
  attempt,
  onBack,
  onRetake,
  quiz,
}) {
  const details = useMemo(() => buildAttemptQuestionReview({ attempt, quiz }), [attempt, quiz]);
  const attemptDate = getAttemptDate(attempt);
  const canRetake = quiz?.allowRetake !== false;

  return (
    <main className="quiz-main quiz-history-main">
      <section className="quiz-attempt-detail-shell">
        <footer className="quiz-attempt-footer-actions">
          <button className="quiz-secondary-button is-compact" onClick={onBack} type="button">
            <Icon name="arrowLeft" size={16} />
            <span>Back to Attempt List</span>
          </button>

          {canRetake ? (
            <button className="quiz-history-retake-button" onClick={onRetake} type="button">
              <span>Retake Quiz</span>
              <Icon name="rotate" size={16} />
            </button>
          ) : null}
        </footer>

        <section className="quiz-attempt-summary-card">
          <header className="quiz-attempt-summary-header">
            <div>
              <h1>{getAttemptTitle(attempt)}</h1>
              <span className="quiz-attempt-completed-dot">Completed</span>
            </div>
            <small>Attempt ID: {getShortAttemptId(attempt?.id)}</small>
          </header>

          <div className="quiz-attempt-summary-meta">
            <span>
              <Icon name="timer" size={15} />
              {formatHistoryDate(attemptDate)}
            </span>
            <span>{formatHistoryTime(attemptDate)}</span>
          </div>

          <div className="quiz-attempt-score-grid">
            <article>
              <span>Score</span>
              <strong>{attempt?.score || 0} / {attempt?.totalQuestions || quiz?.totalQuestions || 0}</strong>
              <small>{attempt?.percentage || 0}%</small>
            </article>
            <article>
              <span>Time Taken</span>
              <strong>{formatAttemptDuration(attempt?.totalTimeTaken)}</strong>
            </article>
            <article>
              <span>Correct</span>
              <strong className="is-correct">{attempt?.correctAnswers || 0}</strong>
            </article>
            <article>
              <span>Wrong</span>
              <strong className="is-wrong">{attempt?.wrongAnswers || 0}</strong>
            </article>
            <article>
              <span>Skipped</span>
              <strong>{attempt?.skippedAnswers || 0}</strong>
            </article>
            <article>
              <span>Total Questions</span>
              <strong>{attempt?.totalQuestions || quiz?.totalQuestions || 0}</strong>
            </article>
          </div>
        </section>

        <section className="quiz-attempt-review-card">
          <header className="quiz-attempt-tabs">
            <span className="is-active">Question Review</span>
          </header>

          <div className="quiz-attempt-question-list">
            {details.map((item, index) => (
              <article className={`quiz-attempt-question-card is-${item.status.toLowerCase()}`} key={item.questionId}>
                <div className="quiz-attempt-question-top">
                  <span className="quiz-attempt-question-number">{index + 1}</span>
                  <h2>{item.questionText}</h2>
                  <QuestionStatus item={item} />
                  <span className="quiz-attempt-time">
                    <small>Time Taken</small>
                    <strong>{item.timeTaken}</strong>
                  </span>
                </div>

                <div className="quiz-attempt-answer-lines">
                  <p>
                    Your Answer:
                    {' '}
                    <strong className={item.isWrong ? 'is-wrong' : item.isCorrect ? 'is-correct' : ''}>
                      {item.selectedAnswer}
                    </strong>
                  </p>

                  {!item.isCorrect ? (
                    <p>
                      Correct Answer:
                      {' '}
                      <strong className="is-correct">{item.correctAnswer}</strong>
                    </p>
                  ) : null}
                </div>

                <ReferenceCard reference={item.reference} />
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
