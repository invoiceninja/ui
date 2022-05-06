/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { updateChanges } from 'common/stores/slices/company-users';
import { useDispatch } from 'react-redux';

export function useSetSurchageTaxValue() {
  const dispatch = useDispatch();
  const company = useCurrentCompany();

  return (index: number) => {
    switch (index) {
      case 0:
        dispatch(
          updateChanges({
            object: 'company',
            property: 'custom_surcharge_taxes1',
            value: !company?.custom_surcharge_taxes1,
          })
        );
        break;
      case 1:
        dispatch(
          updateChanges({
            object: 'company',
            property: 'custom_surcharge_taxes2',
            value: !company?.custom_surcharge_taxes2,
          })
        );
        break;
      case 2:
        dispatch(
          updateChanges({
            object: 'company',
            property: 'custom_surcharge_taxes3',
            value: !company?.custom_surcharge_taxes3,
          })
        );
        break;
      case 3:
        dispatch(
          updateChanges({
            object: 'company',
            property: 'custom_surcharge_taxes4',
            value: !company?.custom_surcharge_taxes4,
          })
        );
        break;
    }
  };
}
