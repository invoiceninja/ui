/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from 'common/enums/entity-state';

export default {
  [EntityState.Active]: 'active',
  [EntityState.Archived]: 'archived',
  [EntityState.Deleted]: 'deleted',
};
