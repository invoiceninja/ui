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

export const today = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const toDateInput = (value: string | undefined): string => {
  return value ? dayjs(value).format('YYYY-MM-DD') : '';
};

export const startDate = (value: string | undefined): string => {
  const date = toDateInput(value);

  return date && date >= today() ? date : today();
};
