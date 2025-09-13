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
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

export function useTableColumns() {
  const [t] = useTranslation();

  const columns: DataTableColumns<Blueprint> = [
    {
      id: 'id',
      label: t('id'),
      format: (field, blueprint) => (
        <Link
          to={route('/documents/blueprints/:id/edit', {
            id: blueprint.id,
          })}
        >
          {blueprint.id.slice(-8)}
        </Link>
      ),
    },
    {
      id: 'name',
      label: t('name'),
      format: (field, blueprint) => blueprint.name || t('untitled_blueprint'),
    },
  ];

  return columns;
}
