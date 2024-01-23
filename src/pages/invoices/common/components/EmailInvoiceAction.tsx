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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { Button } from '$app/components/forms';
import { useNavigate } from 'react-router-dom';
import { Modal } from '$app/components/Modal';
import { EntityActionElement } from '$app/components/EntityActionElement';

interface Props {
  invoice: Invoice;
  isDropdown?: boolean;
}
export function EmailInvoiceAction(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { invoice, isDropdown = false } = props;

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
        <EntityActionElement
          entity="invoice"
          actionKey="email_invoice"
          isCommonActionSection={!isDropdown}
          tooltipText={t('email_invoice')}
          {...(hasClientEmailContacts(invoice.client) && {
            to: route('/invoices/:id/email', {
              id: invoice.id,
            }),
          })}
          icon={MdSend}
        >
          {t('email_invoice')}
        </EntityActionElement>
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
