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
import { Modal } from './Modal';
import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from './forms';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { PasswordConfirmation } from './PasswordConfirmation';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';

interface Props {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  installedVersion: string | undefined;
  latestVersion: string | undefined;
}

export function UpdateAppModal(props: Props) {
  const [t] = useTranslation();

  const { isVisible, setIsVisible, installedVersion, latestVersion } = props;

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isUpgradeLoadingModalOpen, setIsUpgradeLoadingModalOpen] =
    useState<boolean>(false);
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const handleUpdateApp = (password: string, isPasswordRequired: boolean) => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      setIsUpgradeLoadingModalOpen(true);

      request(
        'POST',
        endpoint('/api/v1/self-update'),
        {},
        { headers: { 'X-Api-Password': password } }
      )
        .then(() => window.location.reload())
        .catch((error) => {
          if (error.response?.status === 412) {
            onWrongPasswordEnter(isPasswordRequired);
            setIsPasswordConfirmModalOpen(true);
          }
        })
        .finally(() => {
          setIsFormBusy(false);
          setIsUpgradeLoadingModalOpen(false);
        });
    }
  };

  return (
    <>
      <Modal
        title={t('update')}
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        disableClosing={isFormBusy}
      >
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <span className="font-medium">{t('installed_version')}:</span>

              <span>{installedVersion}</span>
            </div>

            <div className="flex space-x-2">
              <span className="font-medium">{t('latest_version')}:</span>

              <span>{latestVersion}</span>
            </div>
          </div>

          <Button
            behavior="button"
            onClick={() => setIsPasswordConfirmModalOpen(true)}
            disabled={isFormBusy}
            disableWithoutIcon
          >
            {t('update')}
          </Button>
        </div>
      </Modal>

      <Modal
        title={t('self-update')}
        visible={isUpgradeLoadingModalOpen}
        onClose={() => {}}
        disableClosing
      >
        <span className="text-center py-3 font-medium">
          {t('in_progress')}.
        </span>
      </Modal>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={handleUpdateApp}
      />
    </>
  );
}
