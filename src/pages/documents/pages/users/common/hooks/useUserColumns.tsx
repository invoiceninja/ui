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
import { User } from '$app/common/interfaces/docuninja/api';
import { Badge } from '$app/components/Badge';
import { DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

export function useUserColumns() {
  const [t] = useTranslation();

  const columns: DataTableColumns<User> = [
    {
      id: 'name',
      label: t('name'),
      format: (_, user) => `${user.first_name} ${user.last_name}`,
    },
    {
      id: 'email',
      label: t('email'),
      format: (_, user) => (
        <Link
          to={route('/docuninja/users/:id/edit', {
            id: user.id,
          })}
        >
          {user.email}
        </Link>
      ),
    },
    {
      id: 'status',
      label: t('status'),
      format: (_, user) => {
        if (user.is_deleted) {
          return <Badge variant="red">{t('deleted')}</Badge>;
        }

        if (user.archived_at) {
          return <Badge variant="red">{t('archived')}</Badge>;
        }

        return <Badge variant="green">{t('active')}</Badge>;
      },
    },
  ];

  return columns;
}
