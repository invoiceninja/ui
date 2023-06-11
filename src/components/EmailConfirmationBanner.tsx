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
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { Banner } from './Banner';
import { useTranslation } from 'react-i18next';

export function EmailConfirmationBanner() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const handleResendEmail = () => {
    toast.processing();

    request('POST', endpoint('/api/v1/user/:id/reconfirm', { id: user!.id }))
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        toast.error();
        console.error(error);
      });
  };

  return (
    <Banner className="space-x-3">
      <span>{t('confirm_your_email_address')}.</span>

      <div className="flex space-x-1">
        <span
          className="font-medium text-xs md:text-sm text-blue-500 hover:underline cursor-pointer"
          onClick={handleResendEmail}
        >
          {t('resend_email')}
        </span>

        <span className="font-medium text-blue-500">&rarr;</span>
      </div>
    </Banner>
  );
}
