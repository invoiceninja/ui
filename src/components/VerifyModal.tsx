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
import { useNavigate } from 'react-router-dom';
import { Button } from './forms';
import { Modal } from './Modal';

interface Props {
  type: 'email' | 'phone';
  visible: boolean;
}

export function VerifyModal(props: Props) {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const navigate = useNavigate();

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
    <Modal
      title=""
      size="small"
      visible={props.visible}
      onClose={() => {}}
      disableClosing
    >
      <div className="flex flex-col justify-center space-y-7 pb-1 px-3 text-left">
        <span className="text-gray-800 text-xl font-semibold">
          {props.type === 'email'
            ? t('confirmation_required', { link: '' })
            : t('verify_phone_number_help')}
        </span>

        <span className="text-base">
          {props.type === 'email' ? (
            <span>
              {t('confirm_email_help')} <strong>{user?.email}</strong>.
            </span>
          ) : (
            user?.phone
          )}
        </span>

        <div className="flex justify-end items-center w-full">
          {props.type === 'email' && (
            <>
              <Button
                type="minimal"
                className="mr-7"
                onClick={() => navigate('/logout')}
              >
                {t('logout')}
              </Button>

              <Button type="primary" onClick={handleResendEmail}>
                {t('resend_email')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
