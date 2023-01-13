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
import { Details } from '../components/Details';
import { Notes } from '../components/Notes';
import { AdditionalInfo } from '../components/AdditionalInfo';
import { request } from 'common/helpers/request';
import { endpoint, isProduction } from 'common/helpers';
import { toast } from 'common/helpers/toast/toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { TaxSettings } from '../components/Taxes';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { route } from 'common/helpers/route';
import { recurringExpenseAtom } from '../common/atoms';
import { useAtom } from 'jotai';
import { RecurringExpense } from 'common/interfaces/recurring-expense';
import { useBlankRecurringExpenseQuery } from 'common/queries/recurring-expense';
import { useHandleChange } from '../common/hooks';
import { RecurringExpensesFrequency } from 'common/enums/recurring-expense-frequency';

export function Create() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { documentTitle } = useTitle('new_recurring_expense');

  const pages = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
    { name: t('new_recurring_expense'), href: '/recurring_expenses/create' },
  ];

  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [recurringExpense, setRecurringExpense] = useAtom(recurringExpenseAtom);

  const { data } = useBlankRecurringExpenseQuery({
    enabled: !recurringExpense,
  });

  const [errors, setErrors] = useState<ValidationBag>();

  const handleChange = useHandleChange({ setRecurringExpense, setErrors });

  useEffect(() => {
    if (data && !recurringExpense) {
      setRecurringExpense({
        ...data,
        frequency_id: RecurringExpensesFrequency.FREQUENCY_MONTHLY,
      });
    }

    if (searchParams.has('client')) {
      setRecurringExpense(
        (current) =>
          current && {
            ...current,
            client_id: searchParams.get('client') as string,
          }
      );
    }

    return () => {
      isProduction() && setRecurringExpense(undefined);
    };
  }, [data]);

  const onSave = (recurringExpense: RecurringExpense) => {
    toast.processing();

    setErrors(undefined);

    request('POST', endpoint('/api/v1/recurring_expenses'), recurringExpense)
      .then((response: GenericSingleResourceResponse<RecurringExpense>) => {
        toast.success('created_recurring_expense');

        navigate(
          route('/recurring_expenses/:id/edit', { id: response.data.data.id })
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
      });
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/recurring_expenses"
      onSaveClick={() => recurringExpense && onSave(recurringExpense)}
    >
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4">
          <Details
            recurringExpense={recurringExpense}
            handleChange={handleChange}
            taxInputType={taxInputType}
            pageType="create"
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
    </Default>
  );
}
