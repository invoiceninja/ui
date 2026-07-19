/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { roundToPrecision } from './round';

export interface InclusiveTaxBackout {
  net: number;
  tax: number;
  components: number[];
}

export const InclusiveTax = {
  backout(
    amount: number,
    rates: number[],
    precision = 2
  ): InclusiveTaxBackout {
    const combinedRate = rates.reduce((sum, rate) => sum + (rate || 0), 0);

    const components = rates.map((rate) => {
      if (!rate || combinedRate <= 0) {
        return 0;
      }

      return roundToPrecision((amount * rate) / (100 + combinedRate), precision);
    });

    const tax = roundToPrecision(
      components.reduce((sum, component) => sum + component, 0),
      precision
    );

    const net = roundToPrecision(amount - tax, precision);

    return { net, tax, components };
  },
};
