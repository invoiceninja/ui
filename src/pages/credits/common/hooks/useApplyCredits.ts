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
import { useBlankPaymentQuery } from '$app/common/queries/payments';
import { paymentAtom } from '$app/pages/payments/common/atoms';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';

export const useApplyCredits = () => {
  const navigate = useNavigate();

  const setPayment = useSetAtom(paymentAtom);

  const { data: blankPayment } = useBlankPaymentQuery();

  return (credits: Credit[]) => {
    if (blankPayment) {
      setPayment({
        ...blankPayment.data.data,
        invoices: [],
        credits: [],
        client_id: credits[0].client_id,
      });

      credits.forEach((credit) => {
        setPayment(
          (current) =>
            current && {
              ...current,
              credits: [
                ...current.credits,
                {
                  _id: v4(),
                  credit_id: credit.id,
                  amount: credit.balance > 0 ? credit.balance : credit.amount,
                },
              ],
            }
        );
      });

      navigate('/payments/create?action=apply&type=1');
    }
  };
};
