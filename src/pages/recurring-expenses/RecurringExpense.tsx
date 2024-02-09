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
import { Outlet, useParams } from 'react-router-dom';
import { Spinner } from '$app/components/Spinner';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';

export default function RecurringExpense() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('edit_recurring_expense');

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const actions = useActions();

  const { id } = useParams();

  const { data } = useRecurringExpenseQuery({ id });

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
      formatName: () => (
        <DocumentsTabLabel
          numberOfDocuments={recurringExpense?.documents.length}
        />
      ),
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

        $refetch(['recurring_expenses']);
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
      {...((hasPermission('edit_recurring_expense') ||
        entityAssigned(recurringExpense)) &&
        recurringExpense && {
          navigationTopRight: (
            <ResourceActions
              resource={recurringExpense}
              actions={actions}
              onSaveClick={handleSave}
              disableSaveButton={!recurringExpense}
              cypressRef="recurringExpenseActionDropdown"
            />
          ),
        })}
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
