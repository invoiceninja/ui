/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Rule } from 'common/interfaces/transaction-rules';

export const defaultRule: Rule = {
  search_key: 'description',
  operator: 'contains',
  value: '',
};
