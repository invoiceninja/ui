/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Expense } from '$app/common/interfaces/expense';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useHandleChange } from '../common/hooks';
import { AdditionalInfo } from '../create/components/AdditionalInfo';
import { Details } from '../create/components/Details';
import { Notes } from '../create/components/Notes';
import { TaxSettings } from '../create/components/Taxes';

export interface Context {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  expense: Expense;
  setExpense: Dispatch<SetStateAction<Expense | undefined>>;
  taxInputType: 'by_rate' | 'by_amount';
  setTaxInputType: Dispatch<SetStateAction<'by_rate' | 'by_amount'>>;
}

export default function Edit() {
  const context: Context = useOutletContext();

  const {
    setErrors,
    setExpense,
    expense,
    errors,
    taxInputType,
    setTaxInputType,
  } = context;

  const handleChange = useHandleChange({ setExpense, setErrors });

  return (
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
        <Notes expense={expense} handleChange={handleChange} errors={errors} />
      </div>

      <div className="col-span-12 xl:col-span-4 space-y-4">
        <AdditionalInfo
          expense={expense}
          handleChange={handleChange}
          errors={errors}
        />

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
