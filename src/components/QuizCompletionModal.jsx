import Icon from './Icon';

function PartyPopperIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="quiz-completion-popper"
      height="64"
      viewBox="0 0 80 80"
      width="64"
    >
      {/* Ribbons / Streamers */}
      <path
        d="M38 24 C44 14 52 24 60 16 C64 12 68 18 72 14"
        fill="none"
        stroke="#ec4899"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M48 28 C56 22 60 32 68 26 C72 22 76 28 80 24"
        fill="none"
        stroke="#06b6d4"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M32 18 C36 12 42 16 46 10 C50 6 54 12 58 8"
        fill="none"
        stroke="#8b5cf6"
        strokeLinecap="round"
        strokeWidth="2.5"
      />

      {/* Confetti dots */}
      <circle cx="36" cy="12" fill="#ec4899" r="2.5" />
      <circle cx="46" cy="22" fill="#facc15" r="3" />
      <circle cx="62" cy="10" fill="#06b6d4" r="2.5" />
      <circle cx="66" cy="22" fill="#ec4899" r="2" />
      <circle cx="74" cy="18" fill="#facc15" r="2.5" />
      <circle cx="56" cy="32" fill="#8b5cf6" r="2" />
      <circle cx="64" cy="34" fill="#06b6d4" r="2.5" />

      {/* Sparkle star */}
      <path
        d="M42 6 L43.5 10 L47.5 11.5 L43.5 13 L42 17 L40.5 13 L36.5 11.5 L40.5 10 Z"
        fill="#facc15"
      />

      {/* Party horn cone */}
      <g transform="translate(14, 26) rotate(-8 26 26)">
        {/* Cone body */}
        <path
          d="M6 46 L40 18 L20 8 Z"
          fill="#facc15"
          stroke="#eab308"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
        {/* Purple stripe 1 */}
        <path
          d="M11 40 L28 27 L20 23 L9 43 Z"
          fill="#8b5cf6"
        />
        {/* Purple stripe 2 */}
        <path
          d="M17 33 L35 19 L30 16 L14 37 Z"
          fill="#8b5cf6"
        />
        {/* Cone rim / mouth */}
        <ellipse
          cx="30"
          cy="13"
          fill="#fef08a"
          rx="12"
          ry="5.5"
          stroke="#ca8a04"
          strokeWidth="1.2"
          transform="rotate(26 30 13)"
        />
      </g>
    </svg>
  );
}

export default function QuizCompletionModal({
  onViewResult,
  onExploreGitaClass,
  onMaybeLater,
  onViewReward,
}) {
  const handleReward = onViewReward || onExploreGitaClass;
  const handleLater = onMaybeLater || onViewResult;

  return (
    <div className="quiz-completion-backdrop" role="presentation">
      <div
        aria-label="Congratulations! Quiz Completed"
        aria-modal="true"
        className="quiz-completion-modal"
        role="dialog"
      >
        <div className="quiz-completion-badge">
          <Icon name="spark" size={16} />
          <span>Achievement Unlocked!</span>
        </div>

        <div className="quiz-completion-popper-container" aria-hidden="true">
          <PartyPopperIllustration />
        </div>

        <h2 className="quiz-completion-title">
          Congratulations! You have successfully completed the quiz!
        </h2>

        <div className="quiz-completion-divider" aria-hidden="true">
          <span className="quiz-completion-divider-line" />
          <span className="quiz-completion-divider-icon">📜</span>
          <span className="quiz-completion-divider-line" />
        </div>

        <p className="quiz-completion-reward-text">
          As a reward for your excellent effort, you have unlocked an exclusive opportunity:{' '}
        </p>

        <p>
          <strong className="quiz-completion-highlight">
            A 100% Free ISKCON Gita Masterclass!
          </strong>
        </p>

        <p className="quiz-completion-subheading">
          Deepen your understanding and discover life-changing wisdom. Claim your free seat today!
        </p>

        <div className="quiz-completion-actions">
          <button
            className="quiz-completion-btn-reward quiz-completion-btn-explore"
            onClick={handleReward}
            type="button"
          >
            <span className="quiz-completion-btn-icon" aria-hidden="true">🎁</span>
            <span>View Reward!</span>
          </button>

          <button
            className="quiz-completion-btn-later quiz-completion-btn-view"
            onClick={handleLater}
            type="button"
          >
            <span>Maybe Later</span>
          </button>
        </div>
      </div>
    </div>
  );
}
