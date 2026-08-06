import Icon from './Icon';

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export default function TimerCard({ seconds = 0 }) {
  return (
    <div className="quiz-timer-card">
      <Icon name="timer" size={29} />
      <div>
        <strong>{formatTime(seconds)} <i /></strong>
        <span>Time Remaining</span>
      </div>
    </div>
  );
}

