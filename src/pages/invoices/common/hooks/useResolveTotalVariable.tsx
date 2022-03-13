/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { resolveTotalVariable } from '../helpers/resolve-total-variable';
import { useFormatMoney } from './useFormatMoney';

export function useResolveTotalVariable() {
  const formatMoney = useFormatMoney();
  const invoice = useCurrentInvoice();

  return (variable: string) => {
    let value = 0;

    const { property } = resolveTotalVariable(variable);

    console.log(invoice);

    if (invoice) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      value = invoice[property] ?? 0;
    }

    return formatMoney(value);
  };
}
