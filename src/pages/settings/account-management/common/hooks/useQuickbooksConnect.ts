/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';

export function useQuickbooksConnect() {
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleConnect = () => {
    if (isFormBusy) return;

    toast.processing();
    setIsFormBusy(true);

    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'quickbooks',
    })
      .then((response) => {
        const token = response.data.hash;

        toast.dismiss();

        window.location.href = endpoint('/quickbooks/authorize/:token', {
          token,
        });
      })
      .catch(() => {
        toast.error();
        setIsFormBusy(false);
      });
  };

  return { handleConnect, isFormBusy };
}
