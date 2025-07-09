/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Client } from '$app/common/interfaces/docuninja/api';
import { DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

export function useTableColumns() {
  const [t] = useTranslation();

  const columns: DataTableColumns<Client> = [
    {
      id: 'id',
      label: t('id'),
      format: (field, client) => (
        <Link
          to={route('/documents/clients/:id/edit', {
            id: client.id,
          })}
        >
          {client.id.slice(-8)}
        </Link>
      ),
    },
    {
      id: 'name',
      label: t('name'),
      format: (_, client) => client.name,
    },
  ];

  return columns;
}
