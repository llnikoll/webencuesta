import React, { useEffect, useState } from 'react';
import { formatCountdown, getTimeRemaining } from '@/lib/time';

interface CountdownProps {
  revealAt: string;
  isRevealed: boolean;
}

export default function Countdown({ revealAt, isRevealed }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(isRevealed);

  useEffect(() => {
    if (isRevealed) {
      setIsExpired(true);
      return;
    }

    const revealDate = new Date(revealAt);

    const updateCountdown = () => {
      const remaining = getTimeRemaining(revealDate);
      if (remaining <= 0) {
        setIsExpired(true);
        setTimeLeft('¡Los resultados están disponibles!');
      } else {
        setTimeLeft(formatCountdown(remaining));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [revealAt, isRevealed]);

  if (isExpired) {
    return (
      <div className="text-center py-8 bg-green-50 rounded-lg border-2 border-green-200">
        <p className="text-2xl font-bold text-green-600">
          ✓ ¡Los resultados están disponibles!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8 bg-blue-50 rounded-lg border-2 border-blue-200">
      <p className="text-gray-700 mb-2">Los resultados estarán disponibles en:</p>
      <p className="text-4xl font-bold text-indigo-600 font-mono">{timeLeft}</p>
    </div>
  );
}
