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
import { useCompanyTimeFormat } from './useCompanyTimeFormat';
import { useCompanyTimeZone } from './useCompanyTimeZone';
import { useCurrentCompanyDateFormats } from './useCurrentCompanyDateFormats';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function useDateTime() {
  const { timeZone: companyTimeZone } = useCompanyTimeZone();
  const { timeFormat: companyTimeFormat } = useCompanyTimeFormat();
  const { dateFormat: companyDateFormat } = useCurrentCompanyDateFormats();

  return (
    date: number | string,
    dateFormat?: string,
    timeFormat?: string,
    timeZone?: string
  ) => {
    if (date === 0 || date === '' || date === undefined) {
      return '';
    }

    const finalFormat = `${dateFormat || companyDateFormat} ${
      timeFormat || companyTimeFormat
    }`;

    if (typeof date === 'number') {
      return dayjs
        .utc(date)
        .tz(timeZone || companyTimeZone)
        .format(finalFormat);
    }

    return dayjs
      .utc(date)
      .tz(timeZone || companyTimeZone)
      .format(finalFormat);
  };
}
