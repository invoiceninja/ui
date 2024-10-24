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

interface Params {
  formatOnlyTime?: boolean;
}

export function useDateTime(params?: Params) {
  const { formatOnlyTime = false } = params || {};

  const { timeFormat: companyTimeFormat } = useCompanyTimeFormat();
  const { dateFormat: companyDateFormat } = useCurrentCompanyDateFormats();

  return (date: number | string, dateFormat?: string, timeFormat?: string) => {
    if (date === 0 || date === '' || date === undefined) {
      return '';
    }

    const finalFormat = `${dateFormat || companyDateFormat} ${
      timeFormat || companyTimeFormat
    }`;

    if (formatOnlyTime && typeof date === 'number') {
      return dayjs.unix(date).format(timeFormat || companyTimeFormat);
    }

    if (formatOnlyTime && typeof date !== 'number') {
      return dayjs(date).format(timeFormat || companyTimeFormat);
    }

    if (typeof date === 'number') {
      return dayjs.unix(date).format(finalFormat);
    }

    return dayjs(date).format(finalFormat);
  };
}
