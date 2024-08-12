/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';

interface Props {
  start: number;
}

export function DurationClock({ start }: Props) {
  const [elapsedTime, setElapsedTime] = useState(
    Math.floor(Date.now() / 1000) - start
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setElapsedTime(Math.floor(Date.now() / 1000) - start);
  }, [start]);

  const formatTime = (seconds: number) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  };

  return <span>{formatTime(elapsedTime)}</span>;
}
