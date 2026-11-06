/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { Client } from '$app/common/interfaces/client';
import { withoutBlankSetting } from '../helpers/settings';

export function usePaymentTerms(client: Client | undefined) {
  const company = useCurrentCompany();
  const getSetting = useGetSetting();

  const terms = getSetting(
    withoutBlankSetting(client, 'payment_terms'),
    'payment_terms'
  ) as string | null | undefined;

  return terms ?? company?.settings?.payment_terms;
}
