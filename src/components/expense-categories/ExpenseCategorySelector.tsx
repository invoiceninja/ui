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
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function ExpenseCategorySelector(
  props: GenericSelectorProps<ExpenseCategory>
) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (
    <DebouncedCombobox
      {...props}
      value="id"
      endpoint="/api/v1/expense_categories"
      label="name"
      defaultValue={props.value}
      onChange={(category: Record<ExpenseCategory>) =>
        category.resource && props.onChange(category.resource)
      }
      actionLabel={t('new_expense_category')}
      onActionClick={() => navigate('/settings/expense_categories/create')}
    />
  );
}
