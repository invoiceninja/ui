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
import { SendEmailModal } from './SendEmailModal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { Invoice } from '$app/common/interfaces/invoice';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';

interface Props {
  invoices: Invoice[];
  setSelected: (id: string[]) => void;
}

export function SendEmailBulkAction(props: Props) {
  const { invoices } = props;

  const [t] = useTranslation();
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [isContactEmailOpen, setContactEmailOpen] = useState<boolean>(false);

  const haveClientsEmailContacts = () => {
    return invoices.every(({ client }) =>
      client?.contacts.some(({ email }) => email)
    );
  };

  const getInvoiceWithoutClientContacts = () => {
    return invoices.find(
      ({ client }) => !client?.contacts.some(({ email }) => email)
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
                  id: getInvoiceWithoutClientContacts()?.client_id,
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
}
