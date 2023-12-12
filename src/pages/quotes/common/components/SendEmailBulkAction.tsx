/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { useBulkAction } from '../hooks/useBulkAction';
import { Quote } from '$app/common/interfaces/quote';
import { toast } from '$app/common/helpers/toast/toast';

interface Props {
  selectedIds: string[];
  selectedQuotes: Quote[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}
export const SendEmailBulkAction = (props: Props) => {
  const [t] = useTranslation();

  const { selectedIds, selectedQuotes, setSelected } = props;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const bulk = useBulkAction();

  const handleOpenModal = () => {
    const clientHasContacts = selectedQuotes.some(
      ({ client }) => client?.contacts.some(({ email }) => email),
      1
    );

    if (!clientHasContacts) {
      return toast.error('client_email_not_set');
    }

    setIsModalOpen(true);
  };

  return (
    <>
      <DropdownElement
        onClick={handleOpenModal}
        icon={<Icon element={MdSend} />}
      >
        {t('send_email')}
      </DropdownElement>

      <Modal
        title={t('bulk_email_quotes')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <span className="text-lg text-gray-900">{t('are_you_sure')}</span>

        <div className="flex justify-end space-x-4 mt-5">
          <Button
            behavior="button"
            onClick={() => {
              bulk(selectedIds, 'email');
              setSelected([]);
              setIsModalOpen(false);
            }}
          >
            <span className="text-base mx-3">{t('yes')}</span>
          </Button>
        </div>
      </Modal>
    </>
  );
};
