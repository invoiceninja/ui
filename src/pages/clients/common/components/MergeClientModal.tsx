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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { Client } from 'common/interfaces/client';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { updateCompanyUsers } from 'common/stores/slices/company-users';
import { ClientSelector } from 'components/clients/ClientSelector';
import { Modal } from 'components/Modal';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { useState } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  mergeFromClientId: string;
  editPage?: boolean;
}

export function MergeClientModal(props: Props) {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [mergeIntoClientId, setMergeIntoClientId] = useState<string>('');

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleMergeClient = (password: string) => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request(
        'POST',
        endpoint(
          '/api/v1/clients/:mergeIntoClientId/:mergeFromClientId/merge',
          {
            mergeIntoClientId,
            mergeFromClientId: props.mergeFromClientId,
          }
        ),
        {},
        { headers: { 'X-Api-Password': password } }
      )
        .then((response: GenericSingleResourceResponse<Client>) => {
          queryClient.invalidateQueries('/api/v1/clients');

          queryClient.invalidateQueries(
            route('/api/v1/clients/:id', { id: response.data.data.id })
          );

          request('POST', endpoint('/api/v1/refresh'))
            .then((response: AxiosResponse) => {
              toast.success('merged_clients');

              dispatch(updateCompanyUsers(response.data.data));

              setMergeIntoClientId('');

              props.setVisible(false);

              if (props.editPage) {
                navigate('/clients');
              }
            })
            .catch((error: AxiosError) => {
              console.error(error);
              toast.error();
            });
        })
        .catch((error: AxiosError) => {
          if (error.response?.status === 412) {
            toast.error('password_error_incorrect');
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Modal
      title={t('merge_into')}
      visible={props.visible}
      onClose={() => {
        setMergeIntoClientId('');
        props.setVisible(false);
      }}
      overflowVisible
    >
      <ClientSelector
        inputLabel={t('client')}
        onChange={(client) => setMergeIntoClientId(client.id)}
        value={mergeIntoClientId}
        clearButton
        onClearButtonClick={() => setMergeIntoClientId('')}
        withoutAction
        exclude={[props.mergeFromClientId]}
        staleTime={Infinity}
      />

      <div className="self-end pt-2">
        <Button
          disableWithoutIcon
          disabled={!mergeIntoClientId}
          onClick={() => setPasswordConfirmModalOpen(true)}
        >
          {t('merge')}
        </Button>
      </div>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={handleMergeClient}
      />
    </Modal>
  );
}
