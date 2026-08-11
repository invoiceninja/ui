/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Quote } from '$app/common/interfaces/quote';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { SendEmailModal } from './SendEmailModal';

interface Props {
  selectedIds: string[];
  selectedQuotes: Quote[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}
export const SendEmailBulkAction = (props: Props) => {
  const { selectedQuotes, setSelected } = props;

  const [t] = useTranslation();
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [isContactEmailOpen, setContactEmailOpen] = useState<boolean>(false);

  const haveClientsEmailContacts = () => {
    return selectedQuotes.every(({ client }) =>
      client?.contacts.some(({ email }) => email)
    );
  };

  const getQuoteWithoutClientContacts = () => {
    return selectedQuotes.find(
      ({ client }) => !client?.contacts.some(({ email }) => email)
    );
  };

  return (
    <>
      <SendEmailModal
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        quoteIds={selectedQuotes.map(({ id }) => id)}
        setSelected={setSelected}
      />

      <DropdownElement
        onClick={() =>
          haveClientsEmailContacts()
            ? setIsModalVisible(true)
            : setContactEmailOpen(true)
        }
        icon={<Icon element={MdSend} />}
      >
        {t('send_email')}
      </DropdownElement>

      <Modal
        title={t('contact_email')}
        visible={isContactEmailOpen}
        onClose={() => setContactEmailOpen(false)}
      >
        <div className="flex flex-col items-center space-y-4">
          <span className="text-base font-medium">
            {t('client_email_not_set')}.
          </span>

          <Button
            className="self-end"
            onClick={() => {
              navigate(
                route('/clients/:id/edit', {
                  id: getQuoteWithoutClientContacts()?.client_id,
                })
              );
              setContactEmailOpen(false);
            }}
          >
            {t('edit_client')}
          </Button>
        </div>
      </Modal>
    </>
  );
};
