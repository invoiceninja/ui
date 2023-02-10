/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ExpenseCategory } from 'common/interfaces/expense-category';
import { GenericSelectorProps } from 'common/interfaces/generic-selector-props';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { CreateExpenseCategoryModal } from 'pages/settings/expense-categories/components/CreateExpenseCategoryModal';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ExpenseCategorySelectorProps
  extends GenericSelectorProps<ExpenseCategory> {
  initiallyVisible?: boolean;
  setVisible?: Dispatch<SetStateAction<boolean>>;
  setSelectedIds?: Dispatch<SetStateAction<string[]>>;
  staleTime?: number;
}

export function ExpenseCategorySelector(props: ExpenseCategorySelectorProps) {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CreateExpenseCategoryModal
        visible={props.initiallyVisible || isModalOpen}
        setVisible={props.setVisible || setIsModalOpen}
        setSelectedIds={props.setSelectedIds}
        onCreatedCategory={(category: ExpenseCategory) =>
          props.onChange(category)
        }
      />

      {!props.setSelectedIds && (
        <DebouncedCombobox
          inputLabel={props.inputLabel}
          value="id"
          endpoint="/api/v1/expense_categories"
          label="name"
          defaultValue={props.value}
          onChange={(category: Record<ExpenseCategory>) =>
            category.resource && props.onChange(category.resource)
          }
          disabled={props.readonly}
          clearButton={props.clearButton}
          onClearButtonClick={props.onClearButtonClick}
          queryAdditional
          initiallyVisible={props.initiallyVisible}
          actionLabel={t('new_expense_category')}
          onActionClick={() => setIsModalOpen(true)}
          sortBy="name|asc"
          staleTime={props.staleTime}
        />
      )}
    </>
  );
}
