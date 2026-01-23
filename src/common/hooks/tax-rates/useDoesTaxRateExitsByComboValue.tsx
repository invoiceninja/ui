import { TaxRate } from '$app/common/interfaces/tax-rate';
import { useTaxRatesQuery } from '$app/common/queries/tax-rates';

const useDoesTaxRateExitsByComboValue = () => {
  const { data: taxes } = useTaxRatesQuery({
    status: ['active'],
    perPage: 1000,
  });

  return (taxName: string, taxRate: number) => {
    if (!taxes?.data.data || taxName === '' || !taxRate) return true;

    return taxes?.data.data.some(
      (tax: TaxRate) => tax.name === taxName && tax.rate === taxRate
    );
  };
};

export default useDoesTaxRateExitsByComboValue;
