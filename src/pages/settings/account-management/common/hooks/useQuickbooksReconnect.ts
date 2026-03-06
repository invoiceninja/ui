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

export function useQuickbooksReconnect() {
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleReconnect = () => {
    if (isFormBusy) return;

    toast.processing();
    setIsFormBusy(true);

    request('POST', endpoint('/api/v1/quickbooks/reconnect_url'), {})
      .then((response) => {

        const reconnectUrl = response.data.reconnect_url;
        toast.dismiss();

        window.location.href = reconnectUrl;
      })
      .catch(() => {
        toast.error();
        setIsFormBusy(false);
      });
  };

  return { handleReconnect, isFormBusy };
}
