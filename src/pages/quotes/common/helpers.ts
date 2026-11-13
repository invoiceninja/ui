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
import { QuoteStatus } from '$app/common/enums/quote-status';
import { Quote } from '$app/common/interfaces/quote';

const isQuoteExpired = (quote: Quote) => {
  if (!quote.due_date) {
    return false;
  }

  return !dayjs(quote.due_date).add(1, 'day').isAfter(dayjs().startOf('day'));
};

export const isQuoteCancellable = (quote: Quote) => {
  return quote.status_id === QuoteStatus.Sent && !isQuoteExpired(quote);
};
