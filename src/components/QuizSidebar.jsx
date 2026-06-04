import Icon from './Icon';

const navigationItems = [
  { label: 'Home', icon: 'home' },
  { label: 'Learn', icon: 'book' },
  { label: 'Quiz', icon: 'question', isActive: true },
  { label: 'AI Guide', icon: 'message' },
  { label: 'Profile', icon: 'profile' },
];

export default function QuizSidebar() {
  return (
    <aside className="quiz-sidebar" aria-label="Primary navigation">
      <nav className="quiz-sidebar-nav">
        {navigationItems.map((item) => (
          <a
            className={`quiz-nav-item${item.isActive ? ' is-active' : ''}`}
            href={item.label === 'Home' ? '/' : '#'}
            key={item.label}
          >
            <Icon name={item.icon} size={26} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="quiz-streak-card">
        <strong><Icon name="fire" size={24} /> 7</strong>
        <span>Day Streak</span>
      </div>
    </aside>
  );
}
