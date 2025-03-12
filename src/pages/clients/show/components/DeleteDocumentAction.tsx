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
import { Document } from '../pages/Documents';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdDelete } from 'react-icons/md';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { useState } from 'react';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { endpoint } from '$app/common/helpers';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';

interface Props {
  document: Document;
}

export function DeleteDocumentAction(props: Props) {
  const [t] = useTranslation();

  const { document } = props;

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  const [documentId, setDocumentId] = useState<string>('');
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const handleDeleteDocument = (
    password: string,
    isPasswordRequired: boolean
  ) => {
    toast.processing();

    request(
      'DELETE',
      endpoint('/api/v1/documents/:id', { id: documentId }),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => {
        toast.success('deleted_document');
        $refetch(['clients']);
      })
      .catch((error) => {
        if (error.response?.status === 412) {
          onWrongPasswordEnter(isPasswordRequired);
          setIsPasswordConfirmModalOpen(true);
        }
      });
  };

  return (
    <>
      <DropdownElement
        onClick={() => {
          setDocumentId(document.id);
          setIsPasswordConfirmModalOpen(true);
        }}
        icon={<Icon element={MdDelete} />}
      >
        {t('delete')}
      </DropdownElement>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={handleDeleteDocument}
      />
    </>
  );
}
