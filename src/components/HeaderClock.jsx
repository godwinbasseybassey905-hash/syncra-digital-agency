import { useEffect, useState } from 'react';

export default function HeaderClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const weekday = now.toLocaleDateString(undefined, { weekday: 'short' });
  const dayMonth = now.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
  const timeText = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <time
      className="syncra-clock"
      dateTime={now.toISOString()}
      aria-label={`Local date and time: ${weekday}, ${dayMonth}, ${timeText}`}
      aria-live="off"
    >
      <span className="syncra-clock__dot" aria-hidden="true" />
      <span className="syncra-clock__date">
        <span className="syncra-clock__wd">{weekday}, </span>
        <span className="syncra-clock__dm">{dayMonth}</span>
      </span>
      <span className="syncra-clock__sep" aria-hidden="true" />
      <span className="syncra-clock__time">{timeText}</span>
    </time>
  );
}
