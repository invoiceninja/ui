/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { updateChanges } from 'common/stores/slices/company-users';
import { ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';

export function useHandleCurrentCompanyChange() {
  const dispatch = useDispatch();

  return (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(
      updateChanges({
        object: 'company',
        property: event.target.id,
        value: event.target.value,
      })
    );
  };
}
