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
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';
import { $refetch } from '$app/common/hooks/useRefetch';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiGitMerge } from 'react-icons/bi';

interface Props {
  mergeFromVendorId: string;
}

export function MergeVendorsAction(props: Props) {
  const [t] = useTranslation();

  const { mergeFromVendorId } = props;

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [mergeIntoVendorId, setMergeIntoVendorId] = useState<string>('');
  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const handleClose = () => {
    setIsModalOpen(false);
    setMergeIntoVendorId('');
  };

  const handleMergeVendor = (password: string, isPasswordRequired: boolean) => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request(
        'POST',
        endpoint(
          '/api/v1/vendors/:mergeIntoVendorId/:mergeFromVendorId/merge',
          {
            mergeIntoVendorId,
            mergeFromVendorId,
          }
        ),
        {},
        { headers: { 'X-Api-Password': password } }
      )
        .then(() => {
          toast.success('merged_vendors');
          handleClose();
          $refetch(['vendors']);
        })
        .catch((error: AxiosError) => {
          if (error.response?.status === 412) {
            onWrongPasswordEnter(isPasswordRequired);
            setPasswordConfirmModalOpen(true);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <>
      <DropdownElement
        onClick={() => setIsModalOpen(true)}
        icon={<Icon element={BiGitMerge} />}
      >
        {t('merge')}
      </DropdownElement>

      <Modal
        title={t('merge_into')}
        visible={isModalOpen}
        onClose={handleClose}
        overflowVisible
      >
        <VendorSelector
          inputLabel={t('vendor')}
          value={mergeIntoVendorId}
          onChange={(vendor) => setMergeIntoVendorId(vendor.id)}
          onClearButtonClick={() => setMergeIntoVendorId('')}
          exclude={[mergeFromVendorId]}
          withoutAction
          initiallyVisible
        />

        <div className="self-end pt-2">
          <Button
            disableWithoutIcon
            disabled={!mergeIntoVendorId}
            onClick={() => {
              setIsModalOpen(false);

              setTimeout(() => {
                setPasswordConfirmModalOpen(true);
              }, 310);
            }}
          >
            {t('merge')}
          </Button>
        </div>
      </Modal>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={handleMergeVendor}
      />
    </>
  );
}
