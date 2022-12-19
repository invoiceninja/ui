/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { RecurringExpense } from 'common/interfaces/recurring-expense';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useRecurringExpenseQuery } from 'common/queries/recurring-expense';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ResourceActions } from 'components/ResourceActions';
import { Tab, Tabs } from 'components/Tabs';
import { useActions } from 'pages/recurring-expenses/common/hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AdditionalInfo } from '../components/AdditionalInfo';
import { Details } from '../components/Details';
import { Notes } from '../components/Notes';
import { TaxSettings } from '../components/Taxes';
import { useSave } from './hooks/useSave';

export function Edit() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('recurring_expense');

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
    },
  ];

  const [recurringExpense, setRecurringExpense] = useState<RecurringExpense>();

  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [errors, setErrors] = useState<ValidationBag>();

  const save = useSave({ setErrors });

  const handleChange = <T extends keyof RecurringExpense>(
    property: T,
    value: RecurringExpense[typeof property]
  ) => {
    setRecurringExpense(
      (recurringExpense) =>
        recurringExpense && { ...recurringExpense, [property]: value }
    );
  };

  useEffect(() => {
    if (data) {
      setRecurringExpense(data);
    }
  }, [data]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/recurring_expenses"
      onSaveClick={() => recurringExpense && save(recurringExpense)}
      navigationTopRight={
        recurringExpense && (
          <ResourceActions
            resource={recurringExpense}
            label={t('more_actions')}
            actions={actions}
          />
        )
      }
      disableSaveButton={recurringExpense?.client_id.length === 0}
    >
      <div className="space-y-4">
        <Tabs tabs={tabs} />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4">
            <Details
              recurringExpense={recurringExpense}
              handleChange={handleChange}
              taxInputType={taxInputType}
              pageType="edit"
              errors={errors}
            />
          </div>

          <div className="col-span-12 xl:col-span-4">
            <Notes
              recurringExpense={recurringExpense}
              handleChange={handleChange}
            />
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <AdditionalInfo
              recurringExpense={recurringExpense}
              handleChange={handleChange}
            />

            <TaxSettings
              recurringExpense={recurringExpense}
              handleChange={handleChange}
              taxInputType={taxInputType}
              setTaxInputType={setTaxInputType}
            />
          </div>
        </div>
      </div>
    </Default>
  );
}
