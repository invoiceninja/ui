/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { Expense as ExpenseType } from '$app/common/interfaces/expense';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useExpenseQuery } from '$app/common/queries/expenses';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Tab, Tabs } from '$app/components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { useActions } from './common/hooks';
import { useSave } from './edit/hooks/useSave';
import { Spinner } from '$app/components/Spinner';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import Toggle from '$app/components/forms/Toggle';

export default function Expense() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('edit_expense');

  const { id } = useParams();

  const { data } = useExpenseQuery({ id });

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const pages: Page[] = [
    { name: t('expenses'), href: '/expenses' },
    { name: t('edit_expense'), href: route('/expenses/:id/edit', { id }) },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/expenses/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/expenses/:id/documents', { id }),
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={expense?.documents.length} />
      ),
    },
  ];

  const [expense, setExpense] = useState<ExpenseType>();

  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [errors, setErrors] = useState<ValidationBag>();

  const actions = useActions();

  const save = useSave({ setErrors });

  useEffect(() => {
    if (data) {
      setExpense(data);
      setTaxInputType(data.calculate_tax_by_amount ? 'by_amount' : 'by_rate');
    }
  }, [data]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_expense') || entityAssigned(expense)) &&
        expense && {
          navigationTopRight: (
            <ResourceActions
              resource={expense}
              onSaveClick={() => save(expense)}
              actions={actions}
              disableSaveButton={!expense}
              cypressRef="expenseActionDropdown"
            />
          ),
        })}
    >
      {expense ? (
        <div className="space-y-4">
          <Tabs
            tabs={tabs}
            rightSide={
              <div className="flex items-center space-x-3">
                <span className="text-sm">{t('preview')}</span>
                <Toggle />
              </div>
            }
          />

          <Outlet
            context={{
              errors,
              setErrors,
              expense,
              setExpense,
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
