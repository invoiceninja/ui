/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useHandleChange } from '$app/pages/recurring-expenses/common/hooks';
import { Dispatch, SetStateAction } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdditionalInfo } from '../components/AdditionalInfo';
import { Details } from '../components/Details';
import { Notes } from '../components/Notes';
import { TaxSettings } from '../components/Taxes';

export interface Context {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  recurringExpense: RecurringExpense;
  setRecurringExpense: Dispatch<SetStateAction<RecurringExpense | undefined>>;
  taxInputType: 'by_rate' | 'by_amount';
  setTaxInputType: Dispatch<SetStateAction<'by_rate' | 'by_amount'>>;
}

export default function Edit() {
  const context: Context = useOutletContext();

  const {
    setErrors,
    setRecurringExpense,
    recurringExpense,
    errors,
    taxInputType,
    setTaxInputType,
  } = context;

  const handleChange = useHandleChange({ setRecurringExpense, setErrors });

  return (
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
  );
}
