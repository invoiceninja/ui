/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdDownload, MdNotStarted, MdStopCircle } from 'react-icons/md';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { RecurringInvoiceStatus } from '$app/common/enums/recurring-invoice-status';
import { useBulkAction } from '../queries';
import { UpdatePricesAction } from '../components/UpdatePricesAction';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const bulk = useBulkAction();

  const documentsBulk = useDocumentsBulk();

  const getDocumentsIds = (recurringInvoices: RecurringInvoice[]) => {
    return recurringInvoices.flatMap(({ documents }) =>
      documents.map(({ id }) => id)
    );
  };

  const shouldDownloadDocuments = (recurringInvoices: RecurringInvoice[]) => {
    return recurringInvoices.some(({ documents }) => documents.length);
  };

  const shouldShowDownloadDocuments = (
    recurringInvoices: RecurringInvoice[]
  ) => {
    return recurringInvoices.some(({ is_deleted }) => !is_deleted);
  };

  const shouldShowUpdatePrices = (recurringInvoices: RecurringInvoice[]) => {
    return recurringInvoices.some(({ is_deleted }) => !is_deleted);
  };

  const shouldShowStartAction = (recurringInvoices: RecurringInvoice[]) => {
    return recurringInvoices.every(
      ({ status_id }) =>
        status_id === RecurringInvoiceStatus.DRAFT ||
        status_id === RecurringInvoiceStatus.PAUSED
    );
  };

  const shouldShowStopAction = (recurringInvoices: RecurringInvoice[]) => {
    return recurringInvoices.every(
      ({ status_id }) => status_id === RecurringInvoiceStatus.ACTIVE
    );
  };

  const customBulkActions: CustomBulkAction<RecurringInvoice>[] = [
    (selectedIds, selectedRecurringInvoices, onActionCall) =>
      selectedRecurringInvoices &&
      shouldShowStartAction(selectedRecurringInvoices) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'start', onActionCall)}
          icon={<Icon element={MdNotStarted} />}
        >
          {t('start')}
        </DropdownElement>
      ),
    (selectedIds, selectedRecurringInvoices, onActionCall) =>
      selectedRecurringInvoices &&
      shouldShowStopAction(selectedRecurringInvoices) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'stop', onActionCall)}
          icon={<Icon element={MdStopCircle} />}
        >
          {t('stop')}
        </DropdownElement>
      ),
    (_, selectedRecurringInvoices, onActionCall) =>
      selectedRecurringInvoices &&
      shouldShowUpdatePrices(selectedRecurringInvoices) && (
        <UpdatePricesAction
          recurringInvoices={selectedRecurringInvoices}
          onActionCall={onActionCall}
        />
      ),
    (_, selectedRecurringInvoices, onActionCall) =>
      selectedRecurringInvoices &&
      shouldShowDownloadDocuments(selectedRecurringInvoices) && (
        <DropdownElement
          onClick={() =>
            shouldDownloadDocuments(selectedRecurringInvoices)
              ? documentsBulk(
                  getDocumentsIds(selectedRecurringInvoices),
                  'download',
                  onActionCall
                )
              : toast.error('no_documents_to_download')
          }
          icon={<Icon element={MdDownload} />}
        >
          {t('documents')}
        </DropdownElement>
      ),
  ];

  return customBulkActions;
};
