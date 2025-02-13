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
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint, isHosted } from '$app/common/helpers';
import { Popover } from '@headlessui/react';

export const buttonStyles =
  'font-medium text-xs md:text-sm underline cursor-pointer';

export function VerifyEmail() {
  const [t] = useTranslation();
  const user = useCurrentUser();

  const resend = () => {
    toast.processing();

    if (user) {
      request(
        'POST',
        endpoint('/api/v1/user/:id/reconfirm', { id: user.id })
      ).then((response) => toast.success(response.data.message));
    }
  };

  if (!isHosted()) {
    return null;
  }

  if (user?.email_verified_at) {
    return null;
  }

  return (
    <Popover className="relative">
      <div className="max-w-max rounded-lg bg-[#FCD34D] px-6 py-4 shadow-lg">
        <div className="flex items-center justify-center space-x-1">
          <span className="text-sm">{t('confirm_your_email_address')}.</span>

          <div
            className="cursor-pointer text-sm font-semibold underline hover:no-underline"
            onClick={(event) => {
              event.stopPropagation();
              resend();
            }}
          >
            {t('resend_email')}
          </div>
        </div>
      </div>
    </Popover>
  );
}
