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
      })
      .catch((error) => {
        console.error(error);
        toast.error();
      });
  };

  return (
    <Modal
      title=""
      visible={props.visible}
      onClose={() => {}}
      disableClosing
      withoutPadding
    >
      <div className="flex justify-center mt-5">
        <div className="bg-gray-900 rounded-lg py-2 px-2 w-44">
          <img src={logo} />
        </div>
      </div>

      <div className="flex flex-col items-center pt-2 pb-4 sm:text-center">
        {props.type === 'email' && (
          <div className="flex flex-col">
            <span className="text-gray-900 text-xl">
              Please confirm your email address
            </span>

            <span className="text-gray-500 text-lg">{user?.email}</span>
          </div>
        )}

        {props.type === 'email' && (
          <div className="flex justify-between items-center pt-6 pb-2 px-6 w-full">
            <Button type="minimal" className="py-2" onClick={handleRefreshData}>
              {t('refresh_data')}
            </Button>

            <Button
              type="primary"
              className="py-2 mr-4"
              onClick={handleResendEmail}
            >
              {t('resend_email')}
            </Button>

            <Button
              type="minimal"
              className="py-2"
              onClick={() => navigate('/logout')}
            >
              {t('logout')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
