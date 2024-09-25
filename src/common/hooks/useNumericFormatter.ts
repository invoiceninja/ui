/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { numericFormatter } from 'react-number-format';
import { useCurrentCompany } from './useCurrentCompany';
import { useUserNumberPrecision } from './useUserNumberPrecision';

export function useNumericFormatter() {
  const company = useCurrentCompany();
  const userNumberPrecision = useUserNumberPrecision();

  return (
    numStr: string,
    thousandSeparator?: string,
    decimalSeparator?: string,
    precision?: number
  ) => {
    return numericFormatter(numStr, {
      thousandSeparator: thousandSeparator
        ? thousandSeparator
        : company?.use_comma_as_decimal_place
        ? '.'
        : ',',
      decimalSeparator: decimalSeparator
        ? decimalSeparator
        : company?.use_comma_as_decimal_place
        ? ','
        : '.',
      decimalScale: precision || userNumberPrecision,
    });
  };
}
