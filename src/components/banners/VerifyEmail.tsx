/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Banner } from '../Banner';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint, isHosted } from '$app/common/helpers';

export function VerifyEmail() {
  const [t] = useTranslation();
  const user = useCurrentUser();

  const resend = () => {
    toast.processing();

    if (user) {
      request('POST', endpoint('/api/v1/user/:id/reconfirm', { id: user.id }))
        .then((response) => toast.success(response.data.message))
        .catch((error) => {
          toast.error();
          console.error(error);
        });
    }
  };

  if (!isHosted()) {
    return null;
  }

  if (user?.email_verified_at) {
    return null;
  }

  return (
    <Banner variant="orange">
      <div className="flex space-x-1">
        <span>{t('confirm_your_email_address')}.</span>

        <span
          className="font-medium text-xs md:text-sm underline cursor-pointer"
          onClick={resend}
        >
          {t('resend_email')}
        </span>

        <span className="font-medium">&rarr;</span>
      </div>
    </Banner>
  );
}
