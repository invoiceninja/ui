/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { toast } from 'common/helpers/toast/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { route } from 'common/helpers/route';
import { TaxSettings } from '../create/components/Taxes';
import { AdditionalInfo } from '../create/components/AdditionalInfo';
import { Notes } from '../create/components/Notes';
import { Details } from '../create/components/Details';
import { useRecurringExpenseQuery } from '../common/queries';
import { RecurringExpense } from 'common/interfaces/recurring-expenses';

export function CloneRecurring() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { documentTitle } = useTitle('new_recurring_expense');
  const { id } = useParams();
  const { data } = useRecurringExpenseQuery({ id });

  const pages = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
    { name: t('recurring_expense'), href: route('/recurring_expenses/:id/edit', { id }) },
    { name: t('clone'), href: route('/recurring_expenses/:id/clone', { id }) },
  ];

  const [expense, setExpense] = useState<RecurringExpense>();
  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  useEffect(() => {
    if (data) {
      setExpense({ ...data, number: '' });
    }
  }, [data]);

  const handleChange = <T extends keyof RecurringExpense>(
    property: T,
    value: RecurringExpense[typeof property]
  ) => {
    setExpense((expense) => expense && { ...expense, [property]: value });
  };

  const onSave = (expense: RecurringExpense) => {
    toast.processing();

    request('POST', endpoint('/api/v1/recurring_expenses'), expense)
      .then((response: GenericSingleResourceResponse<RecurringExpense>) => {
        toast.success('created_recurring_expense');

        navigate(route('/recurring_expenses/:id/edit', { id: response.data.data.id }));
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      });
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/recurring_expenses"
      onSaveClick={() => expense && onSave(expense)}
    >
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4">
          <Details
            expense={expense}
            handleChange={handleChange}
            taxInputType={taxInputType}
            pageType="create"
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
    </Default>
  );
}
