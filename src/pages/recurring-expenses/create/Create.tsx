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
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RecurringExpensesFrequency } from '$app/common/enums/recurring-expense-frequency';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankRecurringExpenseQuery } from '$app/common/queries/recurring-expense';
import { Default } from '$app/components/layouts/Default';
import { recurringExpenseAtom } from '../common/atoms';
import { useHandleChange } from '../common/hooks';
import { AdditionalInfo } from '../components/AdditionalInfo';
import { Details } from '../components/Details';
import { Notes } from '../components/Notes';
import { TaxSettings } from '../components/Taxes';

export default function Create() {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { documentTitle } = useTitle('new_recurring_expense');

  const pages = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
    { name: t('new_recurring_expense'), href: '/recurring_expenses/create' },
  ];

  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    company?.calculate_expense_tax_by_amount ? 'by_amount' : 'by_rate'
  );

  const [recurringExpense, setRecurringExpense] = useAtom(recurringExpenseAtom);

  const { data } = useBlankRecurringExpenseQuery({
    enabled: typeof recurringExpense === 'undefined',
  });

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = useHandleChange({ setRecurringExpense, setErrors });

  useEffect(() => {
    setRecurringExpense((current) => {
      let value = current;

      if (searchParams.get('action') !== 'clone') {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        const _recurringExpense = cloneDeep(data);

        _recurringExpense.frequency_id =
          RecurringExpensesFrequency.FREQUENCY_MONTHLY;

        if (searchParams.get('client')) {
          _recurringExpense.client_id = searchParams.get('client')!;
        }

        if (searchParams.get('vendor')) {
          _recurringExpense.vendor_id = searchParams.get('vendor')!;
        }

        value = {
          ..._recurringExpense,
          payment_date: company?.mark_expenses_paid
            ? dayjs().format('YYYY-MM-DD')
            : '',
          should_be_invoiced: company?.mark_expenses_invoiceable,
          invoice_documents: company?.invoice_expense_documents,
          calculate_tax_by_amount: taxInputType === 'by_amount',
          uses_inclusive_taxes: company.expense_inclusive_taxes,
        };
      }

      return value;
    });
  }, [data]);

  const onSave = (recurringExpense: RecurringExpense) => {
    if (isFormBusy) {
      return;
    }

    toast.processing();
    setIsFormBusy(true);
    setErrors(undefined);

    request('POST', endpoint('/api/v1/recurring_expenses'), recurringExpense)
      .then((response: GenericSingleResourceResponse<RecurringExpense>) => {
        toast.success('created_recurring_expense');

        $refetch(['recurring_expenses']);

        navigate(
          route('/recurring_expenses/:id/edit', { id: response.data.data.id })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => recurringExpense && onSave(recurringExpense)}
      disableSaveButton={!recurringExpense || isFormBusy}
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
            errors={errors}
          />
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <AdditionalInfo
            recurringExpense={recurringExpense}
            handleChange={handleChange}
            errors={errors}
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
