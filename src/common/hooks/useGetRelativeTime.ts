/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export function useGetRelativeTime() {
  const [t] = useTranslation();

  return (currentTimestamp: number) => {
    const now = dayjs();
    const timestamp = dayjs.unix(currentTimestamp);

    const diffMinutes = now.diff(timestamp, 'minute');
    const diffHours = now.diff(timestamp, 'hour');
    const diffDays = now.diff(timestamp, 'day');

    if (diffMinutes <= 1) {
      return t('just_now');
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return t('yesterday');
    } else {
      return `${diffDays}d ago`;
    }
  };
}
