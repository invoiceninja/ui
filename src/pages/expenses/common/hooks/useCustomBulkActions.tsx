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
import { useExpenseCategoriesQuery } from '$app/common/queries/expense-categories';
import { CustomBulkAction } from '$app/components/DataTable';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCategory, MdDownload } from 'react-icons/md';

interface Props {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  selectedExpenses: Expense[];
}

function ChangeCategory({ isVisible, setIsVisible, selectedExpenses }: Props) {
  const [t] = useTranslation();
  const [category, setCategory] = useState('');

  const { data: expenseCategories } = useExpenseCategoriesQuery({
    status: ['active'],
  });

  useEffect(() => {
    return () => {
      setCategory('');
    };
  }, []);

  const handleChange = () => {
    toast.processing();

    // 
  };

  return (
    <Modal
      title={`${t('change')} ${t('category')}`}
      visible={isVisible}
      onClose={setIsVisible}
      overflowVisible
    >
      <p>{t('list_of_affected_expenses')}</p>

      <ul>
        {selectedExpenses.map(({ id, number }) => (
          <li key={id}>{number}</li>
        ))}
      </ul>

      <SelectField
        value={category}
        onValueChange={setCategory}
        withBlank
      >
        {expenseCategories?.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </SelectField>

      <Button>{t('save')}</Button>
    </Modal>
  );
}

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
    setSelected?: Dispatch<SetStateAction<string[]>>
  ) => {
    const expenseIds = getDocumentsIds(selectedExpenses);

    documentsBulk(expenseIds, 'download');
    setSelected?.([]);
  };

  const [isChangeCategoryVisible, setIsChangeCategoryVisible] = useState(false);

  const customBulkActions: CustomBulkAction<Expense>[] = [
    (_, selectedExpenses, setSelected) => (
      <DropdownElement
        onClick={() =>
          selectedExpenses && shouldDownloadDocuments(selectedExpenses)
            ? handleDownloadDocuments(selectedExpenses, setSelected)
            : toast.error('no_documents_to_download')
        }
        icon={<Icon element={MdDownload} />}
      >
        {t('documents')}
      </DropdownElement>
    ),
    (_, selectedExpenses, setSelected) => (
      <>
        {selectedExpenses ? (
          <ChangeCategory
            isVisible={isChangeCategoryVisible}
            setIsVisible={setIsChangeCategoryVisible}
            selectedExpenses={selectedExpenses}
          />
        ) : null}

        <DropdownElement
          onClick={() =>
            selectedExpenses && selectedExpenses.length
              ? setIsChangeCategoryVisible(true)
              : toast.error('no_expenses_selected')
          }
          icon={<Icon element={MdCategory} />}
        >
          {t('change')} {t('category')}
        </DropdownElement>
      </>
    ),
  ];

  return customBulkActions;
};
