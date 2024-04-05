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
import Select, { MultiValue } from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { Alert } from '$app/components/Alert';
import { useExpenseCategoriesQuery } from '$app/common/queries/expense-categories';
import { useSelectorCustomStyles } from '../hooks/useSelectorCustomStyles';

interface Props {
  value?: string;
  onValueChange: (expenseCategoryKeys: string) => void;
  errorMessage?: string[] | string;
}
export function MultiExpenseCategorySelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const customStyles = useSelectorCustomStyles();

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
          <Select
            id="expenseCategoryItemSelector"
            placeholder={t('expense_categories')}
            {...(value && {
              value: expenseCategories?.filter((option) =>
                value
                  .split(',')
                  .find(
                    (expenseCategoryId) => expenseCategoryId === option.value
                  )
              ),
            })}
            onChange={(options) => onValueChange(handleChange(options))}
            options={expenseCategories}
            isMulti={true}
            styles={customStyles}
          />
        </Element>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </>
  );
}
