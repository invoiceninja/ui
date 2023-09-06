/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringExpenseStatus } from '$app/common/enums/recurring-expense-status';
import { toast } from '$app/common/helpers/toast/toast';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { useBulk } from '$app/common/queries/recurring-expense';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload, MdNotStarted, MdStopCircle } from 'react-icons/md';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const bulk = useBulk();

  const documentsBulk = useDocumentsBulk();

  const shouldDownloadDocuments = (recurringExpenses: RecurringExpense[]) => {
    return recurringExpenses.some(({ documents }) => documents.length);
  };

  const getDocumentsIds = (recurringExpenses: RecurringExpense[]) => {
    return recurringExpenses.flatMap(({ documents }) =>
      documents.map(({ id }) => id)
    );
  };

  const handleDownloadDocuments = (
    selectedRecurringExpenses: RecurringExpense[],
    setSelected?: Dispatch<SetStateAction<string[]>>
  ) => {
    const recurringExpenseIds = getDocumentsIds(selectedRecurringExpenses);

    documentsBulk(recurringExpenseIds, 'download');
    setSelected?.([]);
  };

  const shouldShowStartAction = (recurringExpenses: RecurringExpense[]) => {
    return recurringExpenses.every(
      ({ status_id }) =>
        status_id === RecurringExpenseStatus.Draft ||
        status_id === RecurringExpenseStatus.Paused
    );
  };

  const shouldShowStopAction = (recurringExpenses: RecurringExpense[]) => {
    return recurringExpenses.every(
      ({ status_id }) => status_id === RecurringExpenseStatus.Active
    );
  };

  const customBulkActions: CustomBulkAction<RecurringExpense>[] = [
    (selectedIds, selectedRecurringExpenses, setSelected) =>
      selectedRecurringExpenses &&
      shouldShowStartAction(selectedRecurringExpenses) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'start');

            setSelected?.([]);
          }}
          icon={<Icon element={MdNotStarted} />}
        >
          {t('start')}
        </DropdownElement>
      ),
    (selectedIds, selectedRecurringExpenses, setSelected) =>
      selectedRecurringExpenses &&
      shouldShowStopAction(selectedRecurringExpenses) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'stop');

            setSelected?.([]);
          }}
          icon={<Icon element={MdStopCircle} />}
        >
          {t('stop')}
        </DropdownElement>
      ),
    (_, selectedRecurringExpenses, setSelected) => (
      <DropdownElement
        onClick={() =>
          selectedRecurringExpenses &&
          shouldDownloadDocuments(selectedRecurringExpenses)
            ? handleDownloadDocuments(selectedRecurringExpenses, setSelected)
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
