/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';

interface Props {
  isTaxExempt: boolean;
}

export function TaxExemptBadge({ isTaxExempt }: Props) {
  const [t] = useTranslation();

  if (!isTaxExempt) {
    return null;
  }

  return <Badge variant="orange">{t('tax_exempt')}</Badge>;
}
