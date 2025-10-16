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
import { Invoice } from '$app/common/interfaces/invoice';
import { useCloneToNegativeInvoice } from './useCloneToNegativeInvoice';

export function useRectifyInvoiceModal() {
  const [isRectifyModalOpen, setIsRectifyModalOpen] = useState(false);
  const [pendingInvoice, setPendingInvoice] = useState<Invoice | null>(null);
  const cloneToNegativeInvoice = useCloneToNegativeInvoice();

  const openModal = (invoice: Invoice) => {
    setPendingInvoice(invoice);
    setIsRectifyModalOpen(true);
  };

  const closeModal = () => {
    setIsRectifyModalOpen(false);
    setPendingInvoice(null);
  };

  const confirmRectify = (rectificationReason: string) => {
    if (pendingInvoice) {
      cloneToNegativeInvoice(pendingInvoice, rectificationReason);
      closeModal();
    }
  };

  return {
    isRectifyModalOpen,
    openModal,
    closeModal,
    confirmRectify,
  };
}
