/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useNavigate } from 'react-router';
import { Modal } from '$app/components/Modal';
import { useState } from 'react';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Button } from '$app/components/forms';
import { Document } from '$app/common/interfaces/docuninja/api';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdDelete } from 'react-icons/md';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  document: Document;
}

export function DeleteDocumentAction({ document }: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request(
        'DELETE',
        docuNinjaEndpoint('/api/documents/:id', { id: document.id }),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then(() => {
          toast.success('deleted_document');

          $refetch(['docuninja_documents']);

          setIsModalOpen(false);

          navigate('/documents');
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <>
      <DropdownElement
        icon={<Icon element={MdDelete} />}
        disabled={isFormBusy}
        onClick={() => setIsModalOpen(true)}
      >
        {t('delete')}
      </DropdownElement>

      <Modal
        title={t('are_you_sure')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        disableClosing={isFormBusy}
      >
        <span className="font-medium">{t('delete_docuninja_document')}.</span>

        <Button behavior="button" onClick={handleSubmit} disabled={isFormBusy}>
          {t('continue')}
        </Button>
      </Modal>
    </>
  );
}
