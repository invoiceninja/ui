/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AURegions } from './components/AURegions';
import { EURegions } from './components/EURegions';
import { SellerSubregion } from './components/SellerSubregion';
import { USRegions } from './components/USRegions';

export function CalculateTaxes() {
  return (
    <>
      <SellerSubregion />
      <USRegions />
      <EURegions />
      <AURegions />
    </>
  );
}
