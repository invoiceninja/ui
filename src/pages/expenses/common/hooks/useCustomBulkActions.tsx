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
import { Expense } from '$app/common/interfaces/expense';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const documentsBulk = useDocumentsBulk();

  const shouldDownloadDocuments = (expenses: Expense[]) => {
    return expenses.some(({ documents }) => documents.length);
  };

  const getDocumentsIds = (expenses: Expense[]) => {
    return expenses.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const handleDownloadDocuments = (
    selectedExpenses: Expense[],
    setSelected: Dispatch<SetStateAction<string[]>>
  ) => {
    const expenseIds = getDocumentsIds(selectedExpenses);

    documentsBulk(expenseIds, 'download');
    setSelected([]);
  };

  const customBulkActions: CustomBulkAction<Expense>[] = [
    ({ selectedResources, setSelected }) => (
      <DropdownElement
        onClick={() =>
          shouldDownloadDocuments(selectedResources)
            ? handleDownloadDocuments(selectedResources, setSelected)
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
