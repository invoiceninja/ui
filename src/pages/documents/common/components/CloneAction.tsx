import { Document } from '$app/common/interfaces/docuninja/api';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdControlPointDuplicate } from 'react-icons/md';
import { useCloneDocument } from '../../show/hooks/useCloneDocument';
import { Modal } from '$app/components/Modal';
import { useState } from 'react';
import { Button } from '$app/components/forms';

interface Props {
  document: Document;
}

export function CloneAction({ document }: Props) {
  const [t] = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { cloneDocument, isFormBusy: isCloningDocumentBusy } =
    useCloneDocument();

  return (
    <>
      <Modal
        title={t('are_you_sure')}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <div className="flex flex-col space-y-6">
          <span className="font-medium text-sm">
            {t('clone_document_description')}
          </span>

          <Button
            behavior="button"
            onClick={() => cloneDocument(document)}
            disabled={isCloningDocumentBusy}
            disableWithoutIcon
          >
            {t('continue')}
          </Button>
        </div>
      </Modal>

      {Boolean(document && !document.is_deleted) && (
        <DropdownElement
          onClick={() => setIsModalVisible(true)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone')}
        </DropdownElement>
      )}
    </>
  );
}
