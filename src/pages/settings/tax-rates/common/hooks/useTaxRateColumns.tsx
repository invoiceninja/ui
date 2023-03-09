/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { route } from '$app/common/helpers/route';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { DataTableColumns } from '$app/components/DataTable';
import { useTranslation } from 'react-i18next';

export const useTaxRateColumns = () => {
  const [t] = useTranslation();

  const columns: DataTableColumns<TaxRate> = [
    {
      id: 'name',
      label: t('name'),
      format: (field, resource) => (
        <Link
          to={route('/settings/tax_rates/:id/edit', {
            id: resource.id,
          })}
        >
          {resource?.name}
        </Link>
      ),
    },
    {
      id: 'rate',
      label: t('rate'),
      format: (value) => <span>{value}%</span>,
    },
  ];

  return columns;
};
