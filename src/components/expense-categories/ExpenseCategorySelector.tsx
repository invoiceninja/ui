/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { CreateExpenseCategoryModal } from '$app/pages/settings/expense-categories/components/CreateExpenseCategoryModal';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxAsync, Entry } from '../forms/Combobox';
import { endpoint } from '$app/common/helpers';

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
        <ComboboxAsync<ExpenseCategory>
          endpoint={
            endpoint('/api/v1/expense_categories?status=active')
          }
          onChange={(category: Entry<ExpenseCategory>) =>
            category.resource && props.onChange(category.resource)
          }
          inputOptions={{
            label: props.inputLabel?.toString(),
            value: props.value || null,
          }}
          entryOptions={{
            id: 'id',
            label: 'name',
            value: 'id',
          }}
          action={{
            label: t('new_expense_category'),
            onClick: () => setIsModalOpen(true),
            visible: true,
          }}
          readonly={props.readonly}
          onDismiss={props.onClearButtonClick}
          initiallyVisible={props.initiallyVisible}
          sortBy="name|asc"
          staleTime={props.staleTime}
          errorMessage={props.errorMessage}
        />
      )}
    </>
  );
}
