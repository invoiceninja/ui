/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  injectInChanges,
  updateChanges,
} from 'common/stores/slices/company-users';
import { cloneDeep } from 'lodash';
import { useDispatch } from 'react-redux';
import { useInjectCompanyChanges } from './useInjectCompanyChanges';

export function useHandleCustomFieldChange() {
  const company = useInjectCompanyChanges();
  const dispatch = useDispatch();

  return (field: string, value: string) => {
    const [label] = value.split('|');

    if (label === '') {
      // If we don't have a content, we will remove the field from the company.custom_fields.

      const _company = cloneDeep(company);

      delete _company.custom_fields[field];

      return dispatch(injectInChanges({ object: 'company', data: _company }));
    }

    dispatch(
      updateChanges({
        object: 'company',
        property: `custom_fields.${field}`,
        value,
      })
    );
  };
}
