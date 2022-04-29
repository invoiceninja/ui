/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Payment } from 'common/interfaces/payment';
import { bulk } from 'common/queries/payments';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useEmailPayment() {
  const [t] = useTranslation();

  return (payment: Payment) => {
    const toastId = toast.loading(t('processing'));

    bulk([payment.id], 'email')
      .then(() => toast.success(t('emailed_payment'), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };
}
