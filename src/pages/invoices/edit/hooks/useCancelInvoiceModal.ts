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
import { useBulk } from '$app/common/queries/invoices';

export function useCancelInvoiceModal() {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null);
  const bulk = useBulk();

  const openModal = (invoiceId: string) => {
    setPendingInvoiceId(invoiceId);
    setIsCancelModalOpen(true);
  };

  const closeModal = () => {
    setIsCancelModalOpen(false);
    setPendingInvoiceId(null);
  };

  const confirmCancel = (cancellationReason: string) => {
    if (pendingInvoiceId) {
      bulk([pendingInvoiceId], 'cancel', undefined, { reason: cancellationReason });
      closeModal();
    }
  };

  return {
    isCancelModalOpen,
    openModal,
    closeModal,
    confirmCancel,
  };
}

