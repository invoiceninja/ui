/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Subscription } from '$app/common/interfaces/subscription';
import { DataTableColumns } from '$app/components/DataTable';
import { useTranslation } from 'react-i18next';

export const useSubscriptionColumns = () => {
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();

  const company = useCurrentCompany();

  const columns: DataTableColumns<Subscription> = [
    {
      id: 'name',
      label: t('name'),
    },
    {
      id: 'price',
      label: t('price'),
      format: (value) =>
        formatMoney(
          value,
          company?.settings.country_id,
          company?.settings.currency_id
        ),
    },
  ];

  return columns;
};
