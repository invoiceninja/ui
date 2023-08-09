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
import { useInvalidatePaymentTermCache } from './useInvalidatePaymentTermCache';
import { toast } from '$app/common/helpers/toast/toast';

export function useHandleArchive() {
  const invalidateCache = useInvalidatePaymentTermCache();

  return (id: string) => {
    toast.processing();

    bulk([id], 'archive')
      .then(() => toast.success('archived_payment_term'))
      .finally(() => invalidateCache(id));
  };
}
