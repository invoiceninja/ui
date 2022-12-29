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
import { useLogo } from 'common/hooks/useLogo';
import { updateCompanyUsers } from 'common/stores/slices/company-users';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
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

  const logo = useLogo();

  const navigate = useNavigate();

  const dispatch = useDispatch();

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

  const handleRefreshData = () => {
    toast.processing();

    request('POST', endpoint('/api/v1/refresh'))
      .then((response) => {
        const companyUsers = response.data.data;

        dispatch(updateCompanyUsers(companyUsers));

        toast.dismiss();
      })
      .catch((error) => {
        console.error(error);
        toast.error();
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
      <div className="flex flex-col space-y-10 pb-1 px-3 text-center">
        <div className="flex justify-center">
          <div className="bg-gray-900 rounded-lg py-2 px-2 w-44">
            <img src={logo} />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <span className="text-gray-900 text-xl">
            {props.type === 'email'
              ? t('confirm_your_email_address')
              : t('confirm_your_phone_number')}
          </span>

          <span className="text-gray-500 text-lg">
            {props.type === 'email' ? user?.email : user?.phone}
          </span>
        </div>

        <div className="flex justify-between items-center w-full">
          {props.type === 'email' && (
            <>
              <Button type="minimal" onClick={handleRefreshData}>
                {t('refresh_data')}
              </Button>

              <Button
                type="primary"
                className="mr-4"
                onClick={handleResendEmail}
              >
                {t('resend_email')}
              </Button>

              <Button type="minimal" onClick={() => navigate('/logout')}>
                {t('logout')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
