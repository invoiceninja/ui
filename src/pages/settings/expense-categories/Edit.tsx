/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Card, CardContainer, Element } from '$app/components/cards';
import { InputField, InputLabel } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useExpenseCategoryQuery } from '$app/common/queries/expense-categories';
import { Badge } from '$app/components/Badge';
import { Container } from '$app/components/Container';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Settings } from '$app/components/layouts/Settings';
import { Spinner } from '$app/components/Spinner';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import { Archive } from './components/edit/Archive';
import { Delete } from './components/edit/Delete';
import { Restore } from './components/edit/Restore';

interface ExpenseCategoryInput {
  name: string;
  color: string;
}

export function Edit() {
  const [t] = useTranslation();

  const { id } = useParams();

  const queryClient = useQueryClient();

  const { data } = useExpenseCategoryQuery({ id });

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('expense_settings'), href: '/settings/expense_settings' },
    {
      name: t('edit_expense_category'),
      href: route('/settings/expense_categories/:id/edit', { id }),
    },
  ];

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategoryInput>({
    name: '',
    color: '',
  });

  const handleChange = (
    property: keyof ExpenseCategoryInput,
    value: ExpenseCategoryInput[keyof ExpenseCategoryInput]
  ) => {
    setErrors(undefined);

    setExpenseCategory((prevState) => ({ ...prevState, [property]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setIsFormBusy(true);
      setErrors(undefined);

      toast.processing();

      request(
        'PUT',
        endpoint('/api/v1/expense_categories/:id', { id }),
        expenseCategory
      )
        .then(() => {
          toast.success('updated_expense_category');

          queryClient.invalidateQueries('/api/v1/expense_categories');

          queryClient.invalidateQueries(
            route('/api/v1/expense_categories/:id', { id })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${
      data?.data.data.name
    }`;

    setExpenseCategory(data?.data.data);
  }, [data]);

  return (
    <Settings title={t('expense_categories')} breadcrumbs={pages}>
      {!data && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {data && (
        <Container className="space-y-6">
          <Card
            withSaveButton
            disableSubmitButton={isFormBusy}
            onFormSubmit={handleSubmit}
            title={expenseCategory?.name}
          >
            <Element leftSide={t('status')}>
              {!data.data.data.is_deleted && !data.data.data.archived_at && (
                <Badge variant="primary">{t('active')}</Badge>
              )}

              {data.data.data.archived_at && !data.data.data.is_deleted ? (
                <Badge variant="yellow">{t('archived')}</Badge>
              ) : null}

              {data.data.data.is_deleted && (
                <Badge variant="red">{t('deleted')}</Badge>
              )}
            </Element>

            <CardContainer>
              <InputField
                label={t('name')}
                onValueChange={(value) => handleChange('name', value)}
                value={expenseCategory?.name}
                errorMessage={errors?.errors.name}
                required
              />

              <InputLabel>{t('color')}</InputLabel>

              <ColorPicker
                value={expenseCategory?.color}
                onValueChange={(value) => handleChange('color', value)}
              />
            </CardContainer>
          </Card>

          <Archive />
          <Restore />
          <Delete />
        </Container>
      )}
    </Settings>
  );
}
