/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputField, InputLabel } from '$app/components/forms';
import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Dispatch, RefObject, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { CardContainer } from '$app/components/cards';

interface Props {
  nameFieldRef?: RefObject<HTMLInputElement | undefined>;
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setExpenseCategory: Dispatch<SetStateAction<ExpenseCategory | undefined>>;
  expenseCategory: ExpenseCategory | undefined;
  withCardContainer?: boolean;
}

export function CreateExpenseCategoryForm(props: Props) {
  const [t] = useTranslation();

  const {
    errors,
    setErrors,
    setExpenseCategory,
    expenseCategory,
    nameFieldRef,
    withCardContainer = false,
  } = props;

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

  if (withCardContainer) {
    return (
      <CardContainer>
        <InputField
          innerRef={nameFieldRef}
          required
          label={t('name')}
          value={expenseCategory?.name}
          onValueChange={(value) => handleChange('name', value)}
          errorMessage={errors?.errors.name}
          cypressRef="expenseCategoryNameField"
        />

        <div>
          <InputLabel className="mb-1">{t('color')}</InputLabel>

          <ColorPicker
            value={expenseCategory?.color}
            onValueChange={(value) => handleChange('color', value)}
          />
        </div>
      </CardContainer>
    );
  }

  return (
    <>
      <InputField
        innerRef={nameFieldRef}
        required
        label={t('name')}
        value={expenseCategory?.name}
        onValueChange={(value) => handleChange('name', value)}
        errorMessage={errors?.errors.name}
        cypressRef="expenseCategoryNameField"
      />

      <div>
        <InputLabel className="mb-1">{t('color')}</InputLabel>

        <ColorPicker
          value={expenseCategory?.color}
          onValueChange={(value) => handleChange('color', value)}
        />
      </div>
    </>
  );
}
