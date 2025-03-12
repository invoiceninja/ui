/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdDeleteForever } from 'react-icons/md';
import { usePurgeClient } from '../hooks/usePurgeClient';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { Dispatch, SetStateAction, useState } from 'react';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';

interface Props {
  client: Client;
  setIsPurgeOrMergeActionCalled?: Dispatch<SetStateAction<boolean>>;
}
export function PurgeClientAction(props: Props) {
  const [t] = useTranslation();

  const { client, setIsPurgeOrMergeActionCalled } = props;

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);

  const handlePurgeClient = usePurgeClient({
    setIsPurgeOrMergeActionCalled,
    setPasswordConfirmModalOpen,
  });

  return (
    <>
      <Modal
        title={t('purge_client')}
        visible={isWarningModalOpen}
        onClose={setIsWarningModalOpen}
      >
        <div className="flex flex-col space-y-6">
          <span className="text-left font-medium">
            {t('purge_client_warning')}
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
          handlePurgeClient(password, client.id, isPasswordRequired)
        }
      />
    </>
  );
}
