/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { MdError } from 'react-icons/md';
import { Button } from './forms';

interface Props {
  type: 'email' | 'phone';
}

export function VerifyBanner(props: Props) {
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
    <div className="flex absolute justify-center items-start mt-20 z-20 w-full h-screen">
      <div className="bg-red-700">
        <div className="mx-auto py-3 px-3 sm:px-6">
          <div className="grid grid-flow-col gap-7 items-center sm:text-center">
            <MdError color="white" fontSize={28} />
            <span className="text-white font-medium hidden md:inline">
              {props.type === 'email'
                ? t('email_not_verified')
                : t('phone_number_not_verified')}
            </span>
            {props.type === 'email' && (
              <span className="block sm:ml-2 sm:inline-block">
                <Button
                  type="minimal"
                  className="py-1 px-2 cursor-pointer"
                  onClick={handleResendEmail}
                >
                  <span className="text-gray-800">{t('resend_email')}</span>
                </Button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
