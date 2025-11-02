import { Document, DocumentStatus } from '$app/common/interfaces/docuninja/api';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdCancel } from 'react-icons/md';
import { useVoidDocument } from '../../show/hooks/useVoidDocument';
import { Modal } from '$app/components/Modal';
import { useState } from 'react';
import { Button } from '$app/components/forms';

interface Props {
  document: Document;
}

export function VoidAction({ document }: Props) {
  const [t] = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { voidDocument, isFormBusy: isVoidingDocumentBusy } = useVoidDocument();

  const statusId = document?.status_id;
  const isSent = statusId === DocumentStatus.Sent;
  const isNotVoided = statusId !== DocumentStatus.Voided;

  return (
    <>
      <Modal
        title={t('are_you_sure')}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <div className="flex flex-col space-y-6">
          <Button
            behavior="button"
            onClick={() => voidDocument(document)}
            disabled={isVoidingDocumentBusy}
            disableWithoutIcon
          >
            {t('continue')}
          </Button>
        </div>
      </Modal>

      {Boolean(document && !document.is_deleted && isSent && isNotVoided) && (
        <DropdownElement
          onClick={() => setIsModalVisible(true)}
          icon={<Icon element={MdCancel} />}
        >
          {t('void')}
        </DropdownElement>
      )}
    </>
  );
}
