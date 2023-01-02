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
import { useBlankExpenseQuery } from 'common/queries/expenses';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Details } from './components/Details';
import { Notes } from './components/Notes';
import { AdditionalInfo } from './components/AdditionalInfo';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { toast } from 'common/helpers/toast/toast';
import { useNavigate } from 'react-router-dom';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { TaxSettings } from './components/Taxes';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { route } from 'common/helpers/route';
import { useAtom } from 'jotai';
import { expenseAtom } from '../common/atoms';
import { useHandleChange } from '../common/hooks';

export function Create() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { documentTitle } = useTitle('new_expense');

  const pages = [
    { name: t('expenses'), href: '/expenses' },
    { name: t('new_expense'), href: '/expenses/create' },
  ];

  const [expense, setExpense] = useAtom(expenseAtom);

  const { data } = useBlankExpenseQuery({ enabled: !expense });

  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [errors, setErrors] = useState<ValidationBag>();

  const handleChange = useHandleChange({ setExpense, setErrors });

  useEffect(() => {
    if (data && !expense) {
      setExpense(data);
    }

    return () => setExpense(undefined);
  }, [data]);

  const onSave = (expense: Expense) => {
    toast.processing();

    setErrors(undefined);

    request('POST', endpoint('/api/v1/expenses'), expense)
      .then((response: GenericSingleResourceResponse<Expense>) => {
        toast.success('created_expense');

        navigate(route('/expenses/:id/edit', { id: response.data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          console.error(error);
          toast.error();
        }
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
    </Default>
  );
}
