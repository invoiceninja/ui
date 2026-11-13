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
import { Quote } from '$app/common/interfaces/quote';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { ContactEmailModal } from '$app/components/emails/ContactEmailModal';

interface Props {
  quote: Quote;
  isDropdown?: boolean;
}

export function EmailQuoteAction({ quote, isDropdown = false }: Props) {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const hasEmail = hasContactWithEmail(quote.client?.contacts);

  return (
    <>
      <div onClick={() => !hasEmail && setIsModalOpen(true)}>
        <EntityActionElement
          entity="quote"
          actionKey="email_quote"
          isCommonActionSection={!isDropdown}
          tooltipText={t('email_quote')}
          {...(hasEmail && {
            to: route('/quotes/:id/email', { id: quote.id }),
          })}
          icon={MdSend}
        >
          {t('email_quote')}
        </EntityActionElement>
      </div>

      <ContactEmailModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relation="client"
        relationId={quote.client_id}
      />
    </>
  );
}
