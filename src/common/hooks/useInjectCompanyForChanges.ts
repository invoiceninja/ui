/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { injectInChanges } from 'common/stores/slices/company-users';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentCompany } from './useCurrentCompany';

export function useInjectCompanyForChanges(): void {
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(injectInChanges({ object: 'company', data: company }));
  }, [company]);
}
