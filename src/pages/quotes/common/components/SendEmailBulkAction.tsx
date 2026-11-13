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
import { hasContactWithEmail } from '$app/common/helpers/emails/has-contact-with-email';
import { Quote } from '$app/common/interfaces/quote';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { ContactEmailModal } from '$app/components/emails/ContactEmailModal';
import { Icon } from '$app/components/icons/Icon';
import { SendEmailModal } from './SendEmailModal';

interface Props {
  selectedIds: string[];
  selectedQuotes: Quote[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}
export const SendEmailBulkAction = (props: Props) => {
  const { selectedQuotes, setSelected } = props;

  const [t] = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [isContactEmailOpen, setContactEmailOpen] = useState<boolean>(false);

  const haveClientsEmailContacts = () => {
    return selectedQuotes.every(({ client }) =>
      hasContactWithEmail(client?.contacts)
    );
  };

  const getQuoteWithoutClientContacts = () => {
    return selectedQuotes.find(
      ({ client }) => !hasContactWithEmail(client?.contacts)
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

      <ContactEmailModal
        visible={isContactEmailOpen}
        onClose={() => setContactEmailOpen(false)}
        relation="client"
        relationId={getQuoteWithoutClientContacts()?.client_id}
      />
    </>
  );
};
