/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import collect from 'collect.js';
import { Invoice } from '../interfaces/invoice';
import { useFormatMoney } from './money/useFormatMoney';

type Resource = Invoice;

export function useSumTableColumn() {
  const formatMoney = useFormatMoney();

  return (values: number[] | undefined, resources: Resource[] | undefined) => {
    if (values && resources) {
      const result = values.reduce(
        (total, currentValue) => (total = total + currentValue),
        0
      );

      const clientIds = collect(resources)
        .pluck('client_id')
        .unique()
        .toArray();

      if (clientIds.length > 1) {
        return result;
      }

      return formatMoney(
        result,
        resources[0].client?.country_id,
        resources[0].client?.settings.country_id
      );
    }

    return '-/-';
  };
}
