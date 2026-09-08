/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { bulk } from '$app/common/queries/payment-terms';

export function useHandleDelete() {
  return (id: string) => {
    toast.processing();

    bulk([id], 'delete')
      .then(() => toast.success('deleted_payment_term'))
      .finally(() => $refetch(['payment_terms']));
  };
}
