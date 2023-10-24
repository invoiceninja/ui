/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Client } from '$app/common/interfaces/client';
import { Invoice } from '$app/common/interfaces/invoice';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { Button } from '$app/components/forms';
import { useNavigate } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { Modal } from '$app/components/Modal';

interface Props {
  invoice: Invoice;
  commonActionSection?: boolean;
}
export function EmailInvoiceAction(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const colors = useColorScheme();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { invoice, commonActionSection } = props;

  const hasClientEmailContacts = (client?: Client) => {
    return client?.contacts.some(({ email }) => email);
  };

  return (
    <>
      <div
        onClick={() =>
          !hasClientEmailContacts(invoice.client) && setIsModalOpen(true)
        }
      >
        {!commonActionSection ? (
          <DropdownElement
            to={
              hasClientEmailContacts(invoice.client)
                ? route('/invoices/:id/email', {
                    id: invoice.id,
                  })
                : ''
            }
            icon={<Icon element={MdSend} />}
          >
            {t('email_invoice')}
          </DropdownElement>
        ) : (
          <Button
            className="flex space-x-2"
            behavior="button"
            onClick={() =>
              hasClientEmailContacts(invoice.client) &&
              navigate(route('/invoices/:id/email', { id: invoice.id }))
            }
          >
            <Icon element={MdSend} color={colors.$1} />
            <span>{t('email_invoice')}</span>
          </Button>
        )}
      </div>

      <Modal
        title={t('contact_email')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col items-center space-y-4">
          <span className="text-base font-medium">
            {t('client_email_not_set')}.
          </span>

          <Button
            className="self-end"
            onClick={() => {
              navigate(route('/clients/:id/edit', { id: invoice.client_id }));
              setIsModalOpen(false);
            }}
          >
            {t('edit_client')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
