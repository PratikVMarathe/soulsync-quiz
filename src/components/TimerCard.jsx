import { useEffect, useState } from 'react';
import Icon from './Icon';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export default function TimerCard({ initialSeconds, isPaused = false }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused || seconds <= 0) return undefined;
    const timerId = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timerId);
  }, [isPaused, seconds]);

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
