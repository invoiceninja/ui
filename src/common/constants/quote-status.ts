/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { QuoteStatus } from 'common/enums/quote-status';

export default {
  [QuoteStatus.Draft]: 'draft',
  [QuoteStatus.Active]: 'active',
  [QuoteStatus.Paused]: 'paused',
  [QuoteStatus.Completed]: 'completed',
  [QuoteStatus.Pending]: 'pending',
};
