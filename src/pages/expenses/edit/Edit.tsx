/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Expense } from 'common/interfaces/expense';
import { useExpenseQuery } from 'common/queries/expenses';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdditionalInfo } from '../create/components/AdditionalInfo';
import { Details } from '../create/components/Details';
import { Notes } from '../create/components/Notes';
import { TaxSettings } from '../create/components/Taxes';

export function Edit() {
  const { id } = useParams();
  const { data } = useExpenseQuery({ id });

  const [expense, setExpense] = useState<Expense>();
  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

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
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 xl:col-span-4">
        <Details
          expense={expense}
          handleChange={handleChange}
          taxInputType={taxInputType}
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
  );
}
