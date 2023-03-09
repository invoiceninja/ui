/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { bulk } from '$app/common/queries/payment-terms';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useInvalidatePaymentTermCache } from './useInvalidatePaymentTermCache';

export function useHandleDelete() {
  const [t] = useTranslation();
  const invalidateCache = useInvalidatePaymentTermCache();

  return (id: string) => {
    const toastId = toast.loading(t('processing'));

    bulk([id], 'delete')
      .then(() => toast.success(t('deleted_payment_term'), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() => invalidateCache(id));
  };
}
