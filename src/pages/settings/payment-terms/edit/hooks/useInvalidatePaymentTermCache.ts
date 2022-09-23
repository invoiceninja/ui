/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';

export function useInvalidatePaymentTermCache() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.invalidateQueries(
      route('/api/v1/payment_terms/:id', { id })
    );
  };
}
