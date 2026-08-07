export function formatShortDate(value) {
  if (!value) return 'Recently';

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatTimeTaken(totalSeconds) {
  if (typeof totalSeconds !== 'number' || isNaN(totalSeconds)) return '0s';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds} sec`;
}
