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
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { ContactEmailModal } from '$app/components/emails/ContactEmailModal';

interface Props {
  purchaseOrder: PurchaseOrder;
  isDropdown?: boolean;
}

export function EmailPurchaseOrderAction({
  purchaseOrder,
  isDropdown = false,
}: Props) {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const hasEmail = hasContactWithEmail(purchaseOrder.vendor?.contacts);

  return (
    <>
      <div onClick={() => !hasEmail && setIsModalOpen(true)}>
        <EntityActionElement
          entity="purchase_order"
          actionKey="send_email"
          isCommonActionSection={!isDropdown}
          tooltipText={t('send_email')}
          {...(hasEmail && {
            to: route('/purchase_orders/:id/email', { id: purchaseOrder.id }),
          })}
          icon={MdSend}
        >
          {t('send_email')}
        </EntityActionElement>
      </div>

      <ContactEmailModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relation="vendor"
        relationId={purchaseOrder.vendor_id}
      />
    </>
  );
}
