/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdArchive } from 'react-icons/md';

interface Props {
  document: Document;
}

export function ArchiveDocumentAction({ document }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request(
        'POST',
        docuNinjaEndpoint('/api/documents/bulk'),
        {
          ids: [document.id],
          action: 'archive',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then(() => {
          toast.success('document_archived');

          setIsModalOpen(false);

          $refetch(['docuninja_documents']);
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <>
      <DropdownElement
        icon={<Icon element={MdArchive} />}
        disabled={isFormBusy}
        onClick={() => setIsModalOpen(true)}
      >
        {t('archive')}
      </DropdownElement>

      <Modal
        title={t('are_you_sure')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <span className="text-sm font-medium" style={{ color: colors.$3 }}>
          {t('archive_document_description')}.
        </span>

        <Button behavior="button" onClick={handleSubmit} disabled={isFormBusy}>
          {t('continue')}
        </Button>
      </Modal>
    </>
  );
}
