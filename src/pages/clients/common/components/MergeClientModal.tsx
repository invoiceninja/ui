/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { updateCompanyUsers } from '$app/common/stores/slices/company-users';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { Modal } from '$app/components/Modal';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { useState } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  mergeFromClientId: string;
  setIsPurgeOrMergeActionCalled?: Dispatch<SetStateAction<boolean>>;
}

export function MergeClientModal(props: Props) {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isEditOrShowPage } = useEntityPageIdentifier({
    entity: 'client',
  });

  const { setIsPurgeOrMergeActionCalled } = props;

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  const [mergeIntoClientId, setMergeIntoClientId] = useState<string>('');

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleMergeClient = (password: string) => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);
      setIsPurgeOrMergeActionCalled?.(true);

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
        .then(() => {
          $refetch(['clients']);

          request('POST', endpoint('/api/v1/refresh'))
            .then((response: AxiosResponse) => {
              toast.success('merged_clients');

              dispatch(updateCompanyUsers(response.data.data));

              setMergeIntoClientId('');

              props.setVisible(false);

              if (isEditOrShowPage) {
                navigate('/clients');
              }
            })
            .catch(() => setIsPurgeOrMergeActionCalled?.(false));
        })
        .catch((error: AxiosError) => {
          if (error.response?.status === 412) {
            toast.error('password_error_incorrect');
            setLastPasswordEntryTime(0);
          }

          setIsPurgeOrMergeActionCalled?.(false);
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
        dropdownLabelFn={(client) => (
          <div className="flex items-center space-x-1">
            <span>{client.display_name}</span>

            {client.contacts[0]?.email && (
              <span className="text-xs">({client.contacts[0].email})</span>
            )}
          </div>
        )}
        initiallyVisible
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
