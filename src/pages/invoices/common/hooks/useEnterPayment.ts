/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { useBlankPaymentQuery } from '$app/common/queries/payments';
import { paymentAtom } from '$app/pages/payments/common/atoms';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';

export function useEnterPayment() {
  const navigate = useNavigate();

  const setPayment = useSetAtom(paymentAtom);

  const { data: blankPayment } = useBlankPaymentQuery();

  return (invoices: Invoice[]) => {
    if (blankPayment) {
      setPayment({
        ...blankPayment.data.data,
        invoices: [],
        credits: [],
        client_id: invoices[0].client_id,
      });

      invoices.forEach((invoice) => {
        setPayment(
          (current) =>
            current && {
              ...current,
              invoices: [
                ...current.invoices,
                {
                  _id: v4(),
                  invoice_id: invoice.id,
                  amount:
                    invoice.balance > 0 ? invoice.balance : invoice.amount,
                },
              ],
            }
        );
      });

      navigate('/payments/create?action=enter');
    }
  };
}
