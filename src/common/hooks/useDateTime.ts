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
import { useCurrentCompanyDateFormats } from './useCurrentCompanyDateFormats';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useCompanyTimeZone } from './useCompanyTimeZone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Params {
  formatOnlyTime?: boolean;
  withTimezone?: boolean;
  formatOnlyDate?: boolean;
}

export function useDateTime(params?: Params) {
  const {
    formatOnlyTime = false,
    withTimezone = false,
    formatOnlyDate = false,
  } = params || {};

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

    let finalFormat = `${dateFormat || companyDateFormat} ${
      timeFormat || companyTimeFormat
    }`;

    if (formatOnlyDate) {
      finalFormat = dateFormat || companyDateFormat;
    }

    if (formatOnlyTime) {
      finalFormat = timeFormat || companyTimeFormat;
    }

    if (typeof date === 'number' && !withTimezone) {
      return dayjs.unix(date).format(finalFormat);
    }

    if (typeof date !== 'number' && !withTimezone) {
      return dayjs(date).format(finalFormat);
    }

    return dayjs
      .utc(date)
      .tz(timeZone || companyTimeZone)
      .format(finalFormat);
  };
}
