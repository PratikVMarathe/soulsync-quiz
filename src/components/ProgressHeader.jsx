export default function ProgressHeader({ currentQuestion, totalQuestions }) {
  const percentage = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div className="quiz-progress-header">
      <strong>Question {currentQuestion} of {totalQuestions}</strong>
      <div
        aria-label={`${percentage}% complete`}
        aria-valuemax="100"
        aria-valuemin="0"
        aria-valuenow={percentage}
        className="quiz-progress-track"
        role="progressbar"
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
      <em>{percentage}% Complete</em>
    </div>
  );
}
