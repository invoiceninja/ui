/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { creditAtom } from '$app/pages/credits/common/atoms';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

export function useReverseInvoice() {
  const navigate = useNavigate();

  const setCredit = useSetAtom(creditAtom);

  return (invoice: Invoice) => {
    setCredit({
      ...(invoice as unknown as Credit),
      number: '',
      documents: [],
      invoice_id: invoice.id,
    });

    navigate('/credits/create?action=reverse');
  };
}
