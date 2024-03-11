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

interface Props {
  client: Client;
  setIsPurgeOrMergeActionCalled?: Dispatch<SetStateAction<boolean>>;
}
export function PurgeClientAction(props: Props) {
  const [t] = useTranslation();

  const { client, setIsPurgeOrMergeActionCalled } = props;

  const handlePurgeClient = usePurgeClient({ setIsPurgeOrMergeActionCalled });

  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);

  return (
    <>
      <DropdownElement
        onClick={() => setPasswordConfirmModalOpen(true)}
        icon={<Icon element={MdDeleteForever} />}
      >
        {t('purge')}
      </DropdownElement>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={(password) => handlePurgeClient(password, client.id)}
      />
    </>
  );
}
