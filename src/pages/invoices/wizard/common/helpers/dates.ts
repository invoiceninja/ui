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

export const addDays = (from: string, days: number): string => {
  return dayjs(from || today())
    .add(days, 'day')
    .format('YYYY-MM-DD');
};
