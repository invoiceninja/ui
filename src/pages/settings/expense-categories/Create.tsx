/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ButtonOption, Card } from '$app/components/cards';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useTitle } from '$app/common/hooks/useTitle';
import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankExpenseCategoryQuery } from '$app/common/queries/expense-categories';
import { Icon } from '$app/components/icons/Icon';
import { Settings } from '$app/components/layouts/Settings';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { CreateExpenseCategoryForm } from './components/CreateExpenseCategoryForm';
import { $refetch } from '$app/common/hooks/useRefetch';

export function Create() {
  useTitle('new_expense_category');

  const [t] = useTranslation();

  const navigate = useNavigate();
  const accentColor: string = useAccentColor();

  const { data: blankExpenseCategory } = useBlankExpenseCategoryQuery();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('expense_settings'), href: '/settings/expense_settings' },
    {
      name: t('new_expense_category'),
      href: '/settings/expense_categories/create',
    },
  ];

  const handleSave = (
    event: FormEvent<HTMLFormElement>,
    actionType: string
  ) => {
    event.preventDefault();

    if (!isFormBusy) {
      setIsFormBusy(true);

      toast.processing();

      request('POST', endpoint('/api/v1/expense_categories'), expenseCategory)
        .then((response: GenericSingleResourceResponse<ExpenseCategory>) => {
          toast.success('created_expense_category');

          $refetch(['expense_categories']);

          if (actionType === 'save') {
            navigate(
              route('/settings/expense_categories/:id/edit', {
                id: response.data.data.id,
              })
            );
          } else {
            if (blankExpenseCategory) {
              setExpenseCategory({
                ...blankExpenseCategory,
                color: accentColor,
              });
            }
          }
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const saveOptions: ButtonOption[] = [
    {
      onClick: (event: FormEvent<HTMLFormElement>) =>
        handleSave(event, 'create'),
      text: `${t('save')} / ${t('create')}`,
      icon: <Icon element={BiPlusCircle} />,
    },
  ];

  useEffect(() => {
    if (blankExpenseCategory) {
      setExpenseCategory({ ...blankExpenseCategory, color: accentColor });
    }
  }, [blankExpenseCategory]);

  return (
    <Settings title={t('expense_categories')} breadcrumbs={pages}>
      <Card
        title={t('create_expense_category')}
        withSaveButton
        disableSubmitButton={isFormBusy}
        onSaveClick={(event) => handleSave(event, 'save')}
        additionalSaveOptions={saveOptions}
      >
        <CreateExpenseCategoryForm
          expenseCategory={expenseCategory}
          setExpenseCategory={setExpenseCategory}
          errors={errors}
          setErrors={setErrors}
        />
      </Card>
    </Settings>
  );
}
