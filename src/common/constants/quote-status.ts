/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { QuoteStatus } from 'common/enums/quote-status';

export default {
  [QuoteStatus.Draft]: 'draft',
  [QuoteStatus.Sent]: 'sent',
  [QuoteStatus.Approved]: 'approved',
  [QuoteStatus.Converted]: 'converted',
  [QuoteStatus.Expired]: 'expired',
};
