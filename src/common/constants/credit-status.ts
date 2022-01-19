/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CreditStatus } from 'common/enums/credit-status';

export default {
  [CreditStatus.Draft]: 'draft',
  [CreditStatus.Sent]: 'sent',
  [CreditStatus.Partial]: 'partial',
  [CreditStatus.Applied]: 'applied',
};
