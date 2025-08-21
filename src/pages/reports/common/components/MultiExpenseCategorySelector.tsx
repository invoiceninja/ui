/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Spinner } from '$app/components/Spinner';
import { Element } from '$app/components/cards';
import { SelectOption } from '$app/components/datatables/Actions';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiValue } from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { useExpenseCategoriesQuery } from '$app/common/queries/expense-categories';
import { useSelectorCustomStyles } from '../hooks/useSelectorCustomStyles';
import { CustomMultiSelect } from '$app/components/forms/CustomMultiSelect';
import { ErrorMessage } from '$app/components/ErrorMessage';

interface Props {
  value?: string;
  onValueChange: (expenseCategoryKeys: string) => void;
  errorMessage?: string[] | string;
}
export function MultiExpenseCategorySelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { customStyles } = useSelectorCustomStyles();

  const { value, onValueChange, errorMessage } = props;

  const [expenseCategories, setExpenseCategories] = useState<SelectOption[]>();

  const { data: expenseCategoriesResponse } = useExpenseCategoriesQuery({
    status: ['active'],
  });

  useEffect(() => {
    if (expenseCategoriesResponse) {
      setExpenseCategories(
        expenseCategoriesResponse.map((expenseCategory) => ({
          value: expenseCategory.id,
          label: expenseCategory.name,
          color: colors.$3,
          backgroundColor: colors.$1,
        }))
      );
    }
  }, [expenseCategoriesResponse]);

  const handleChange = (
    expenseCategories: MultiValue<{ value: string; label: string }>
  ) => {
    return (expenseCategories as SelectOption[])
      .map((option: { value: string; label: string }) => option.value)
      .join(',');
  };

  return (
    <>
      {expenseCategories ? (
        <Element leftSide={t('expense_categories')}>
          <CustomMultiSelect
            id="expenseCategoryItemSelector"
            {...(value && {
              value: expenseCategories?.filter((option) =>
                value
                  .split(',')
                  .find(
                    (expenseCategoryId) => expenseCategoryId === option.value
                  )
              ),
            })}
            onValueChange={(options) => onValueChange(handleChange(options))}
            options={expenseCategories}
            isSearchable={true}
          />
        </Element>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      <ErrorMessage className="mt-2">{errorMessage}</ErrorMessage>
    </>
  );
}
