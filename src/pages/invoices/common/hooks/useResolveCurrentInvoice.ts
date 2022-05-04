/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from 'common/interfaces/invoice';
import { useInvoiceQuery } from 'common/queries/invoices';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function useResolveCurrentInvoice() {
  const { id } = useParams();
  const { data } = useInvoiceQuery({ id });
  const [invoice, setInvoice] = useState<Invoice>();

  useEffect(() => {
    if (data?.data.data) {
      setInvoice(data.data.data);
    }
  }, [data]);

  return invoice;
}
