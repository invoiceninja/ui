/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CardContainer } from '$app/components/cards';
import { InputField, InputLabel } from '$app/components/forms';
import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';

interface Props {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setExpenseCategory: Dispatch<SetStateAction<ExpenseCategory | undefined>>;
  expenseCategory: ExpenseCategory | undefined;
}

export function CreateExpenseCategoryForm(props: Props) {
  const [t] = useTranslation();

  const { errors, setErrors, setExpenseCategory, expenseCategory } = props;

  const colors = useColorScheme();

  const handleChange = (
    property: keyof ExpenseCategory,
    value: ExpenseCategory[keyof ExpenseCategory]
  ) => {
    setErrors(undefined);

    setExpenseCategory(
      (prevState) =>
        prevState && {
          ...prevState,
          [property]: value,
        }
    );
  };

  return (
    <CardContainer>
      <InputField
        style={{
          color: colors.$3,
          colorScheme: colors.$0,
          backgroundColor: colors.$1,
          borderColor: colors.$4,
        }}
        required
        label={t('name')}
        value={expenseCategory?.name}
        onValueChange={(value) => handleChange('name', value)}
        errorMessage={errors?.errors.name}
        cypressRef="expenseCategoryNameField"
      />

      <InputLabel>{t('color')}</InputLabel>

      <ColorPicker
        value={expenseCategory?.color}
        onValueChange={(value) => handleChange('color', value)}
      />
    </CardContainer>
  );
}
