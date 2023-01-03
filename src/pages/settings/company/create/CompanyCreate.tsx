/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { AxiosError, AxiosResponse } from 'axios';
import { AuthenticationTypes } from 'common/dtos/authentication';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { updateCompanyUsers } from 'common/stores/slices/company-users';
import { authenticate } from 'common/stores/slices/user';
import { Modal } from 'components/Modal';
import { useState, SetStateAction, Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CompanyCreate(props: Props) {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const switchCompany = (
    index: number,
    passedUser: Record<string, unknown>,
    passedToken: string
  ) => {
    dispatch(
      authenticate({
        type: AuthenticationTypes.TOKEN,
        user: passedUser,
        token: passedToken,
      })
    );

    localStorage.setItem('X-CURRENT-INDEX', index.toString());

    localStorage.setItem('COMPANY-EDIT-OPENED', 'false');

    queryClient.invalidateQueries();

    window.location.href = route('/');
  };

  const handleSave = async () => {
    if (!isFormBusy) {
      toast.processing();

      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/companies'))
        .then(() => {
          request('POST', endpoint('/api/v1/refresh'))
            .then((response: AxiosResponse) => {
              const companyUsers = response.data.data;

              const createdCompanyIndex = companyUsers.length - 1;

              const companyUser = companyUsers[createdCompanyIndex];

              dispatch(updateCompanyUsers(companyUsers));

              toast.success('created_new_company');

              props.setIsModalOpen(false);

              switchCompany(
                createdCompanyIndex,
                companyUser.user,
                companyUser.token.token
              );
            })
            .catch((error: AxiosError) => {
              console.error(error);
              toast.error();
            });
        })
        .catch((error: AxiosError) => {
          console.error(error);
          toast.error();
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Modal
      title={t('add_company')}
      visible={props.isModalOpen}
      onClose={() => props.setIsModalOpen(false)}
      backgroundColor="white"
    >
      <span className="text-lg text-gray-900">{t('are_you_sure')}</span>

      <div className="flex justify-end space-x-4 mt-5">
        <Button
          className="text-gray-900"
          onClick={() => props.setIsModalOpen(false)}
          type="minimal"
        >
          <span className="text-base mx-3">{t('cancel')}</span>
        </Button>
        <Button onClick={handleSave}>
          <span className="text-base mx-3">{t('yes')}</span>
        </Button>
      </div>
    </Modal>
  );
}
