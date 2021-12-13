/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RootState } from 'common/stores/store';
import { useSelector } from 'react-redux';

export function useCurrentCompany() {
  const companyState = useSelector((state: RootState) => state.company.current);

  return companyState?.company;
}
