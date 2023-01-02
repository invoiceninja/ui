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
import { Expense } from 'common/interfaces/expense';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useExpenseQuery } from 'common/queries/expenses';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ResourceActions } from 'components/ResourceActions';
import { Tab, Tabs } from 'components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useActions } from '../common/hooks';
import { AdditionalInfo } from '../create/components/AdditionalInfo';
import { Details } from '../create/components/Details';
import { Notes } from '../create/components/Notes';
import { TaxSettings } from '../create/components/Taxes';
import { useSave } from './hooks/useSave';

export function Edit() {
  const { documentTitle } = useTitle('expense');
  const { id } = useParams();
  const { data } = useExpenseQuery({ id });

  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('expenses'), href: '/expenses' },
    { name: t('edit_expense'), href: route('/expenses/:id', { id }) },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/expenses/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/expenses/:id/documents', { id }),
    },
  ];

  const [expense, setExpense] = useState<Expense>();
  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [errors, setErrors] = useState<ValidationBag>();

  const actions = useActions();

  const save = useSave({ setErrors });

  const handleChange = <T extends keyof Expense>(
    property: T,
    value: Expense[typeof property]
  ) => {
    setExpense((expense) => expense && { ...expense, [property]: value });
  };

  useEffect(() => {
    if (data) {
      setExpense(data);
    }
  }, [data]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/expenses"
      onSaveClick={() => expense && save(expense)}
      navigationTopRight={
        expense && (
          <ResourceActions
            resource={expense}
            label={t('more_actions')}
            actions={actions}
          />
        )
      }
    >
      <div className="space-y-4">
        <Tabs tabs={tabs} />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4">
            <Details
              expense={expense}
              handleChange={handleChange}
              taxInputType={taxInputType}
              pageType="edit"
              errors={errors}
            />
          </div>

          <div className="col-span-12 xl:col-span-4">
            <Notes expense={expense} handleChange={handleChange} />
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <AdditionalInfo expense={expense} handleChange={handleChange} />

            <TaxSettings
              expense={expense}
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
