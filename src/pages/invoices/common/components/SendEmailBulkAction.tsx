/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { hasContactWithEmail } from '$app/common/helpers/emails/has-contact-with-email';
import { Invoice } from '$app/common/interfaces/invoice';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { ContactEmailModal } from '$app/components/emails/ContactEmailModal';
import { Icon } from '$app/components/icons/Icon';
import { SendEmailModal } from './SendEmailModal';

interface Props {
  invoices: Invoice[];
  setSelected: (id: string[]) => void;
}

export function SendEmailBulkAction(props: Props) {
  const { invoices } = props;

  const [t] = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [isContactEmailOpen, setContactEmailOpen] = useState<boolean>(false);

  const haveClientsEmailContacts = () => {
    return invoices.every(({ client }) =>
      hasContactWithEmail(client?.contacts)
    );
  };

  const getInvoiceWithoutClientContacts = () => {
    return invoices.find(
      ({ client }) => !hasContactWithEmail(client?.contacts)
    );
  };

  return (
    <>
      <SendEmailModal
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        invoiceIds={invoices.map(({ id }) => id)}
        setSelected={props.setSelected}
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
        relationId={getInvoiceWithoutClientContacts()?.client_id}
      />
    </>
  );
}
