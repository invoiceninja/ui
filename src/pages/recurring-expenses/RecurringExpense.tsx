/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { RecurringExpense as RecurringExpenseEntity } from '$app/common/interfaces/recurring-expense';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useRecurringExpenseQuery } from '$app/common/queries/recurring-expense';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Tab, Tabs } from '$app/components/Tabs';
import { useActions } from '$app/pages/recurring-expenses/common/hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Outlet, useParams } from 'react-router-dom';
import { Spinner } from '$app/components/Spinner';

export default function RecurringExpense() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('edit_recurring_expense');

  const actions = useActions();

  const { id } = useParams();

  const { data } = useRecurringExpenseQuery({ id });

  const queryClient = useQueryClient();

  const pages: Page[] = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
    {
      name: t('edit_recurring_expense'),
      href: route('/recurring_expenses/:id', { id }),
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/recurring_expenses/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/recurring_expenses/:id/documents', { id }),
    },
  ];

  const [recurringExpense, setRecurringExpense] =
    useState<RecurringExpenseEntity>();

  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [errors, setErrors] = useState<ValidationBag>();

  useEffect(() => {
    if (data) {
      setRecurringExpense(data);
      setTaxInputType(data.calculate_tax_by_amount ? 'by_amount' : 'by_rate');
    }
  }, [data]);

  const handleSave = () => {
    toast.processing();

    setErrors(undefined);

    request(
      'PUT',
      endpoint('/api/v1/recurring_expenses/:id', {
        id: recurringExpense!.id,
      }),
      recurringExpense
    )
      .then(() => {
        toast.success('updated_recurring_expense');

        queryClient.invalidateQueries(
          route('/api/v1/recurring_expenses/:id', {
            id: recurringExpense!.id,
          })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      });
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={handleSave}
      navigationTopRight={
        recurringExpense && (
          <ResourceActions
            resource={recurringExpense}
            label={t('more_actions')}
            actions={actions}
          />
        )
      }
      disableSaveButton={!recurringExpense}
    >
      {recurringExpense ? (
        <div className="space-y-4">
          <Tabs tabs={tabs} />

          <Outlet
            context={{
              errors,
              setErrors,
              recurringExpense,
              setRecurringExpense,
              taxInputType,
              setTaxInputType,
            }}
          />
        </div>
      ) : (
        <Spinner />
      )}
    </Default>
  );
}
