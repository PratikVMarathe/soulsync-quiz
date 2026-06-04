import Icon from './Icon';

const getInitials = (user) => {
  const name = user?.displayName || user?.email || 'Soul Sync';
  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

export default function QuizTopbar({ user, onExit }) {
  return (
    <header className="quiz-topbar">
      <a className="quiz-brand" href="/" aria-label="SoulSync home">
        <Icon name="lotus" size={40} />
        <span>SoulSync</span>
        <small>Wisdom for a meaningful life</small>
      </a>

      <div className="quiz-topbar-actions">
        <button className="quiz-exit-button" onClick={onExit} type="button">
          <Icon name="close" size={18} />
          <span>Exit Quiz</span>
        </button>
        <span className="quiz-shortcut-hint">Press 1-4 to answer</span>
        <span className="quiz-user-avatar" aria-label={`Signed in as ${getInitials(user)}`}>
          {getInitials(user)}
        </span>
      </div>
    </header>
  );
}
