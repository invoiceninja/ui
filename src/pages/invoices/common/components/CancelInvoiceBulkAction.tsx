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

interface Props {
  selectedIds: string[];
  selectedResources: Invoice[];
  setSelected: (ids: string[]) => void;
  showCancelOption: (invoices: Invoice[]) => boolean;
}

export function CancelInvoiceBulkAction({ selectedIds, selectedResources, setSelected, showCancelOption }: Props) {
  const [t] = useTranslation();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const bulk = useBulk();

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = (cancellationReason: string) => {
    bulk(selectedIds, 'cancel', undefined, { reason: cancellationReason });
    setSelected([]);
    setIsCancelModalOpen(false);
  };

  if (!showCancelOption(selectedResources)) {
    return null;
  }

  return (
    <>
      <DropdownElement
        onClick={handleCancel}
        icon={<Icon element={MdCancel} />}
      >
        {t('cancel_invoice')}
      </DropdownElement>
      
      <CancelInvoiceModal
        visible={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
}
