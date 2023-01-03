/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringExpenseStatus } from 'common/enums/recurring-expense-status';

export default {
  [RecurringExpenseStatus.ACTIVE]: 'active',
  [RecurringExpenseStatus.DRAFT]: 'draft',
  [RecurringExpenseStatus.PAUSED]: 'paused',
};
