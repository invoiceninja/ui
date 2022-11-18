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
import { Details } from './components/Details';
import { Notes } from './components/Notes';
import { AdditionalInfo } from './components/AdditionalInfo';
import { TaxSettings } from './components/Taxes';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { RecurringExpense } from 'common/interfaces/recurring-expense';
import { useBlankRecurringExpenseQuery } from '../common/queries';
import { useAtom } from 'jotai';
import { recurringExpenseAtom } from '../common/atoms';
import { useCreate, useRecurringExpenseUtilities } from '../common/hooks';
import { cloneDeep } from 'lodash';
import { Page } from 'components/Breadcrumbs';

export function Create() {
  const [t] = useTranslation();
  const { documentTitle } = useTitle('new_recurring_expense');

  const pages: Page[] = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
    { name: t('new_recurring_expense'), href: 'recurring_expenses/create' },
  ];

  const [recurringExpense, setRecurringExpense] = useAtom(recurringExpenseAtom);
  const [errors, setErrors] = useState<ValidationBag>();
  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const { handleChange } = useRecurringExpenseUtilities();

  const { data } = useBlankRecurringExpenseQuery({
    enabled: typeof recurringExpense === 'undefined',
  });

  useEffect(() => {
    if (
      typeof data !== 'undefined' &&
      typeof recurringExpense === 'undefined'
    ) {
      const _recurringExpense = cloneDeep(data);
      setRecurringExpense(_recurringExpense);
    }
  }, [data]);

  const save = useCreate({ setErrors });
  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={'/recurring_expenses'}
      onSaveClick={() => save(recurringExpense as RecurringExpense)}
    >
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4">
          <Details
            expense={recurringExpense}
            handleChange={handleChange}
            taxInputType={taxInputType}
            pageType="create"
            errors={errors}
          />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <Notes expense={recurringExpense} handleChange={handleChange} />
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <AdditionalInfo
            expense={recurringExpense}
            handleChange={handleChange}
          />

          <TaxSettings
            expense={recurringExpense}
            handleChange={handleChange}
            taxInputType={taxInputType}
            setTaxInputType={setTaxInputType}
          />
        </div>
      </div>
    </Default>
  );
}
