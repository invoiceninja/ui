/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { usePaymentQuery } from 'common/queries/payments';
import { useEffect, useState } from 'react';

export function useConvertCurrencyToggle(params: {
  id: string | undefined;
}): any[] {
  const { data: payment } = usePaymentQuery({ id: params.id });
  const [changeCurrency, setchangeCurrency] = useState(false);
  useEffect(() => {
    setchangeCurrency(Boolean(payment?.data.data.exchange_currency_id));
  }, [payment]);

  return [changeCurrency, setchangeCurrency];
}
