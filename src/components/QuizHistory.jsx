import { useEffect, useMemo, useState } from 'react';
import { loadUserAttemptsForQuiz } from '../services/quizAttemptService';
import {
  buildHistorySummary,
  decorateAttempts,
  formatHistoryDate,
  formatHistoryTime,
  getAttemptDate,
  getScoreTone,
} from '../utils/quizHistory';
import { formatAttemptDuration } from '../utils/quizAttempt';
import Icon from './Icon';
import QuizAttemptDetails from './QuizAttemptDetails';
import QuizIntroVisual from './QuizIntroVisual';

function formatScore(attempt, totalQuestions) {
  if (!attempt) return '-';
  return `${attempt.score || 0}/${attempt.totalQuestions || totalQuestions || 0}`;
}

function StatusPill({ status }) {
  const label = status === 'COMPLETED' ? 'Completed' : status === 'IN_PROGRESS' ? 'In Progress' : 'Abandoned';

  return (
    <span className={`quiz-history-status is-${status?.toLowerCase() || 'unknown'}`}>
      {label}
    </span>
  );
}

export default function QuizHistory({
  onExit,
  onGoToQuiz,
  onRetake,
  quiz,
  user,
}) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('LATEST');
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    let ignoreResult = false;

    async function fetchAttempts() {
      if (!user?.uid || !quiz?.slug) {
        setAttempts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await loadUserAttemptsForQuiz({ userId: user.uid, quizSlug: quiz.slug });
        if (!ignoreResult) setAttempts(data);
      } catch (err) {
        console.error('Failed to load history', err);
        if (!ignoreResult) setAttempts([]);
      } finally {
        if (!ignoreResult) setLoading(false);
      }
    }

    fetchAttempts();

    return () => {
      ignoreResult = true;
    };
  }, [quiz?.slug, user?.uid]);

  const decoratedAttempts = useMemo(() => decorateAttempts(attempts, sort), [attempts, sort]);
  const summary = useMemo(() => buildHistorySummary(attempts, quiz), [attempts, quiz]);
  const canRetake = quiz?.allowRetake !== false && summary.completedAttempts.length > 0;

  if (selectedAttempt) {
    return (
      <QuizAttemptDetails
        attempt={selectedAttempt}
        onBack={() => setSelectedAttempt(null)}
        onRetake={onRetake || onGoToQuiz}
        quiz={quiz}
      />
    );
  }

  return (
    <main className="quiz-main quiz-history-main">
      <section className="quiz-history-shell">
        <div className="quiz-history-action-buttons" style={{ display: 'flex', gap: '16px' }}>
          <button className="quiz-secondary-button" onClick={onExit} type="button">
            <Icon name="arrowLeft" size={17} />
            <span>Back to Quiz Library</span>
          </button>

        </div>
        <header className="quiz-history-hero">
          <div className="quiz-history-hero-art">
            <QuizIntroVisual alt={quiz?.heroAlt} imageUrl={quiz?.heroImage} visualKey={quiz?.visualKey} />
          </div>

          <div className="quiz-history-hero-copy">
            <span className="quiz-history-active-pill">Active</span>
            <h1>{quiz?.introTitle || quiz?.title}</h1>
            <p>{quiz?.description}</p>
          </div>
          <div className="quiz-history-action-buttons" style={{ display: 'flex', gap: '16px' }}>

            <button className="quiz-history-go-button" onClick={onGoToQuiz} type="button">
              <span>Start Quiz</span>
              <Icon name="arrow" size={17} />
            </button>
          </div>

        </header>

        <section className="quiz-history-card quiz-history-summary-card">
          <h2>Your Progress Summary</h2>

          {loading ? (
            <p className="quiz-history-loading">Loading history...</p>
          ) : (
            <div className="quiz-history-summary-grid">
              <article>
                <span>Latest Score</span>
                <strong>{formatScore(summary.latestAttempt, summary.totalQuestions)}</strong>
                {summary.latestAttempt ? (
                  <small className={getScoreTone(summary.latestAttempt.percentage)}>
                    {summary.latestAttempt.percentage || 0}%
                  </small>
                ) : null}
              </article>

              <article>
                <span>Best Score</span>
                <strong>{formatScore(summary.bestAttempt, summary.totalQuestions)}</strong>
                {summary.bestAttempt ? (
                  <small className={getScoreTone(summary.bestAttempt.percentage)}>
                    {summary.bestAttempt.percentage || 0}%
                  </small>
                ) : null}
              </article>

              <article>
                <span>Attempts</span>
                <strong>{summary.totalAttempts}</strong>
              </article>

              <article>
                <span>Average Score</span>
                <strong className="is-average">{summary.averageScore}%</strong>
              </article>

              <article>
                <span>Last Attempt</span>
                <strong>{formatHistoryDate(summary.lastAttemptDate)}</strong>
                <small>{formatHistoryTime(summary.lastAttemptDate)}</small>
              </article>
            </div>
          )}
        </section>

        <section className="quiz-history-card quiz-history-attempts-card">
          <div className="quiz-history-section-header">
            <h2>All Attempts</h2>
            <label>
              <span>Sort by:</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="LATEST">Latest</option>
                <option value="OLDEST">Oldest</option>
                <option value="BEST_SCORE">Best Score</option>
              </select>
            </label>
          </div>

          {loading ? (
            <p className="quiz-history-loading">Loading history...</p>
          ) : decoratedAttempts.length ? (
            <div className="quiz-history-table-wrap">
              <table className="quiz-history-table">
                <thead>
                  <tr>
                    <th>Attempt</th>
                    <th>Date & Time</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Time Taken</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {decoratedAttempts.map((attempt) => {
                    const attemptDate = getAttemptDate(attempt);
                    const canViewAttempt = attempt.status === 'COMPLETED';

                    return (
                      <tr key={attempt.id}>
                        <td data-label="Attempt">
                          <span className="quiz-history-attempt-label">
                            {attempt.isBestAttempt ? (
                              <Icon name="trophy" size={16} />
                            ) : attempt.isLatestAttempt ? (
                              <Icon name="star" size={16} />
                            ) : null}
                            <strong>#{attempt.attemptNumber}</strong>
                            {attempt.isLatestAttempt ? <small>(Latest)</small> : null}
                            {attempt.isFirstAttempt ? <small>(First Attempt)</small> : null}
                          </span>
                        </td>
                        <td data-label="Date & Time">
                          <span className="quiz-history-date-stack">
                            <strong>{formatHistoryDate(attemptDate)}</strong>
                            <small>{formatHistoryTime(attemptDate)}</small>
                          </span>
                        </td>
                        <td data-label="Score">{formatScore(attempt, quiz?.totalQuestions)}</td>
                        <td data-label="Percentage">
                          <strong className={`quiz-history-percent ${getScoreTone(attempt.percentage)}`}>
                            {attempt.percentage || 0}%
                          </strong>
                        </td>
                        <td data-label="Time Taken">{formatAttemptDuration(attempt.totalTimeTaken)}</td>
                        <td data-label="Status">
                          <StatusPill status={attempt.status} />
                        </td>
                        <td data-label="Action">
                          {canViewAttempt ? (
                            <button
                              aria-label={`View attempt ${attempt.attemptNumber}`}
                              className="quiz-history-eye-button"
                              onClick={() => setSelectedAttempt(attempt)}
                              type="button"
                            >
                              <Icon name="eye" size={18} />
                            </button>
                          ) : (
                            <span className="quiz-history-no-action">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="quiz-history-empty">No attempts found.</p>
          )}
        </section>

        {canRetake ? (
          <footer className="quiz-history-retake-card">
            <Icon name="info" size={20} />
            <p>
              <strong>Retake Available:</strong>
              {' '}
              You can retake this quiz to improve your score.
            </p>
            <button className="quiz-history-retake-button" onClick={onRetake || onGoToQuiz} type="button">
              <span>Retake Quiz</span>
              <Icon name="rotate" size={16} />
            </button>
          </footer>
        ) : null}
      </section>
    </main>
  );
}
