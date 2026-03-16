/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdDeleteForever } from 'react-icons/md';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { useState } from 'react';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { User } from '$app/common/interfaces/user';
import { usePurgeUser } from '../hooks/usePurgeUser';

interface Props {
  user: User;
}

export function PurgeUserAction({ user }: Props) {
  const [t] = useTranslation();

  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);
  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const handlePurgeUser = usePurgeUser({
    setPasswordConfirmModalOpen,
  });

  return (
    <>
      <Modal
        title={t('warning')}
        visible={isWarningModalOpen}
        onClose={setIsWarningModalOpen}
      >
        <div className="flex flex-col space-y-6">
          <span className="text-left font-medium">
            {t('purge_user_confirmation')}
          </span>

          <Button
            onClick={() => {
              setIsWarningModalOpen(false);

              setTimeout(() => {
                setPasswordConfirmModalOpen(true);
              }, 310);
            }}
          >
            {t('continue')}
          </Button>
        </div>
      </Modal>

      <DropdownElement
        onClick={() => setIsWarningModalOpen(true)}
        icon={<Icon element={MdDeleteForever} />}
      >
        {t('purge')}
      </DropdownElement>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={(password, isPasswordRequired) =>
          handlePurgeUser(password, user.id, isPasswordRequired)
        }
      />
    </>
  );
}
