import { TaxRate } from '$app/common/interfaces/tax-rate';
import { useTaxRatesQuery } from '$app/common/queries/tax-rates';

export default function useDoesTaxRateExistByComboValue() {
  const { data: taxes } = useTaxRatesQuery({
    status: ['active'],
    perPage: 1000,
  });

  return (taxName: string, taxRate: number) => {
    if (!taxes?.data.data || !taxName || !taxRate) return true;

    return taxes?.data.data.some(
      (tax: TaxRate) =>
        tax.name.toLowerCase() === taxName.toLowerCase() && tax.rate === taxRate
    );
  };
}
