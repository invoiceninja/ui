/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CardContainer } from '@invoiceninja/cards';
import { InputField, InputLabel } from '@invoiceninja/forms';
import { ExpenseCategory } from 'common/interfaces/expense-category';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { ColorPicker } from 'components/forms/ColorPicker';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setExpenseCategory: Dispatch<SetStateAction<ExpenseCategory | undefined>>;
  expenseCategory: ExpenseCategory | undefined;
}

export function CreateExpenseCategoryForm(props: Props) {
  const [t] = useTranslation();

  const { errors, setErrors, setExpenseCategory, expenseCategory } = props;

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
        required
        label={t('name')}
        value={expenseCategory?.name}
        onValueChange={(value) => handleChange('name', value)}
        errorMessage={errors?.errors.name}
      />

      <InputLabel>{t('color')}</InputLabel>

      <ColorPicker
        value={expenseCategory?.color}
        onValueChange={(value) => handleChange('color', value)}
      />
    </CardContainer>
  );
}
