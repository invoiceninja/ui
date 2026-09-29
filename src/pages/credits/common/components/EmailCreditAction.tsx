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
import { Credit } from '$app/common/interfaces/credit';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { ContactEmailModal } from '$app/components/emails/ContactEmailModal';

interface Props {
  credit: Credit;
  isDropdown?: boolean;
}

export function EmailCreditAction({ credit, isDropdown = false }: Props) {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const hasEmail = hasContactWithEmail(credit.client?.contacts);

  return (
    <>
      <div onClick={() => !hasEmail && setIsModalOpen(true)}>
        <EntityActionElement
          entity="credit"
          actionKey="email_credit"
          isCommonActionSection={!isDropdown}
          tooltipText={t('email_credit')}
          {...(hasEmail && {
            to: route('/credits/:id/email', { id: credit.id }),
          })}
          icon={MdSend}
        >
          {t('email_credit')}
        </EntityActionElement>
      </div>

      <ContactEmailModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relation="client"
        relationId={credit.client_id}
      />
    </>
  );
}
