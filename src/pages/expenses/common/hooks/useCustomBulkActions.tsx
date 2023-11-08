/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { Expense } from '$app/common/interfaces/expense';
import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { useBulk } from '$app/common/queries/expenses';
import { CustomBulkAction } from '$app/components/DataTable';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, Link } from '$app/components/forms';
import { ComboboxAsync } from '$app/components/forms/Combobox';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCategory, MdDownload } from 'react-icons/md';

interface Props {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  selectedExpenses: Expense[];
  setSelected?: Dispatch<SetStateAction<string[]>>;
}

function ChangeCategory({
  isVisible,
  setIsVisible,
  selectedExpenses,
  setSelected,
}: Props) {
  const [t] = useTranslation();
  const [category, setCategory] = useState('');

  const bulk = useBulk();

  useEffect(() => {
    return () => {
      setCategory('');
    };
  }, []);

  const handleSubmit = () => {
    toast.processing();

    const ids = selectedExpenses.map(({ id }) => id);

    bulk(ids, 'bulk_categorize', { category_id: category });

    if (setSelected) {
      setSelected([]);
    }

    setIsVisible(false);
    setCategory('');
  };

  return (
    <Modal
      title={`${t('change')} ${t('category')}`}
      visible={isVisible}
      onClose={setIsVisible}
      overflowVisible
    >
      <p>{t('recurring_expenses')}:</p>

      <ul>
        {selectedExpenses.map(({ id, number }) => (
          <li key={id}>{number}</li>
        ))}
      </ul>

      <ComboboxAsync<ExpenseCategory>
        endpoint={endpoint('/api/v1/expense_categories')}
        inputOptions={{
          value: category,
          label: t('category') ?? '',
        }}
        entryOptions={{
          id: 'id',
          label: 'name',
          value: 'id',
        }}
        onChange={(e) => (e.resource ? setCategory(e.resource.id) : null)}
      />

      <p>
        <span className="capitalize">{t('manage')}</span>{' '}
        <Link className="lowercase" to="/settings/expense_settings">
          {t('expense_categories')}
        </Link>
      </p>

      <Button onClick={handleSubmit}>{t('save')}</Button>
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
            setSelected={setSelected}
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
