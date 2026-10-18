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
import { route } from '$app/common/helpers/route';
import { Invoice } from '$app/common/interfaces/invoice';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { ContactEmailModal } from '$app/components/emails/ContactEmailModal';

interface Props {
  invoice: Invoice;
  isDropdown?: boolean;
}
export function EmailInvoiceAction(props: Props) {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { invoice, isDropdown = false } = props;

  const hasEmail = hasContactWithEmail(invoice.client?.contacts);

  return (
    <>
      <div onClick={() => !hasEmail && setIsModalOpen(true)}>
        <EntityActionElement
          entity="invoice"
          actionKey="email_invoice"
          isCommonActionSection={!isDropdown}
          tooltipText={t('email_invoice')}
          {...(hasEmail && {
            to: route('/invoices/:id/email', {
              id: invoice.id,
            }),
          })}
          icon={MdSend}
        >
          {t('email_invoice')}
        </EntityActionElement>
      </div>

      <ContactEmailModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relation="client"
        relationId={invoice.client_id}
      />
    </>
  );
}
