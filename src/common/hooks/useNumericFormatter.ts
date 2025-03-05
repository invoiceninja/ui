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

  const getThousandSeparator = (
    currentThousandSeparator: string | undefined
  ) => {
    if (currentThousandSeparator) {
      return currentThousandSeparator;
    }

    if (company?.use_comma_as_decimal_place) {
      return '.';
    }

    return ',';
  };

  const getDecimalSeparator = (currentDecimalSeparator: string | undefined) => {
    if (currentDecimalSeparator) {
      return currentDecimalSeparator;
    }

    if (company?.use_comma_as_decimal_place) {
      return ',';
    }

    return '.';
  };

  return (
    numStr: string,
    thousandSeparator?: string,
    decimalSeparator?: string,
    precision?: number
  ) => {
    return numericFormatter(numStr.replaceAll(',', ''), {
      thousandSeparator: getThousandSeparator(thousandSeparator),
      decimalSeparator: getDecimalSeparator(decimalSeparator),
      decimalScale: precision || userNumberPrecision,
    });
  };
}
