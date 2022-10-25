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
import { Expense } from 'common/interfaces/expense';
import { useExpenseQuery } from 'common/queries/expenses';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { toast } from 'common/helpers/toast/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Details } from '../create/components/Details';
import { Notes } from '../create/components/Notes';
import { AdditionalInfo } from '../create/components/AdditionalInfo';
import { TaxSettings } from '../create/components/Taxes';
import { route } from 'common/helpers/route';

export function Clone() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { documentTitle } = useTitle('new_expense');
  const { id } = useParams();
  const { data } = useExpenseQuery({ id });

  const pages = [
    { name: t('expenses'), href: '/expenses' },
    { name: t('expense'), href: route('/expenses/:id/edit', { id }) },
    { name: t('clone'), href: route('/expenses/:id/clone', { id }) },
  ];

  const [expense, setExpense] = useState<Expense>();
  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  useEffect(() => {
    if (data) {
      setExpense({ ...data, number: '' });
    }
  }, [data]);

  const handleChange = <T extends keyof Expense>(
    property: T,
    value: Expense[typeof property]
  ) => {
    setExpense((expense) => expense && { ...expense, [property]: value });
  };

  const onSave = (expense: Expense) => {
    toast.processing();

    request('POST', endpoint('/api/v1/expenses'), expense)
      .then((response: GenericSingleResourceResponse<Expense>) => {
        toast.success('created_expense');

        navigate(route('/expenses/:id/edit', { id: response.data.data.id }));
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
      onBackClick="/expenses"
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
