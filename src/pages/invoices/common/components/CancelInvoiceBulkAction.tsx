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
import { Invoice } from '$app/common/interfaces/invoice';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdCancel } from 'react-icons/md';
import { useBulk } from '$app/common/queries/invoices';
import { CancelInvoiceModal } from '$app/pages/invoices/edit/components/CancelInvoiceModal';
import { useCompanyVerifactu } from '$app/common/hooks/useCompanyVerifactu';

interface Props {
  selectedIds: string[];
  selectedResources: Invoice[];
  setSelected: (ids: string[]) => void;
}

export function CancelInvoiceBulkAction({ selectedIds, selectedResources, setSelected }: Props) {
  const [t] = useTranslation();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const bulk = useBulk();
  const verifactuEnabled = useCompanyVerifactu();

  // Debug logging
  console.log('[CancelInvoiceBulkAction] verifactuEnabled:', verifactuEnabled);

  const handleCancel = () => {
    console.log('[CancelInvoiceBulkAction] handleCancel called, verifactuEnabled:', verifactuEnabled);
    // If Verifactu is enabled, show modal to get cancellation reason
    // Otherwise, cancel directly without modal
    if (verifactuEnabled) {
      console.log('[CancelInvoiceBulkAction] Opening modal');
      setIsCancelModalOpen(true);
    } else {
      console.log('[CancelInvoiceBulkAction] Cancelling directly');
      bulk(selectedIds, 'cancel');
      setSelected([]);
    }
  };

  const handleConfirmCancel = (cancellationReason: string) => {
    bulk(selectedIds, 'cancel', undefined, { reason: cancellationReason });
    setSelected([]);
    setIsCancelModalOpen(false);
  };

  return (
    <>
      <DropdownElement
        onClick={handleCancel}
        icon={<Icon element={MdCancel} />}
      >
        {t('cancel_invoice')}
      </DropdownElement>
      
      {verifactuEnabled && (
        <CancelInvoiceModal
          visible={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </>
  );
}
