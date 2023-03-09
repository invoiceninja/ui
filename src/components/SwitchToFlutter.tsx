/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { Flutter } from './icons';

export function SwitchToFlutter() {
  const account = useCurrentAccount();

  const onClick = () => {
    toast.processing();

    request('PUT', endpoint('/api/v1/accounts/:id', { id: account.id }), {
      set_react_as_default_ap: false,
    })
      .then(() => (window.location.href = window.location.origin))
      .catch((error) => {
        console.error(error);

        error.response?.status === 400
          ? toast.error(error.response.data.message)
          : toast.error('error_title');
      });
  };

  return (
    <>
      <button title="Switch to Flutter version of the app" onClick={onClick}>
        <Flutter width={24} height={24} />
      </button>
    </>
  );
}
