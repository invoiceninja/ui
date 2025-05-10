/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Client } from '$app/common/interfaces/client';
import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

interface Props {
  client?: Client;
  clientId?: string;
  displayClientName?: boolean;
}

export function ClientActionButtons(props: Props) {
  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  const colors = useColorScheme();

  const { client, displayClientName, clientId } = props;

  return (
    <div className="flex flex-col space-y-1">
      {displayClientName && (
        <span className="text-sm font-medium">{client?.display_name}</span>
      )}

      <div className="space-x-2">
        {hasPermission('edit_client') && (
          <Link
            className="font-medium"
            to={route('/clients/:id/edit', { id: client?.id || clientId })}
          >
            {t('edit')}
          </Link>
        )}

        {hasPermission('edit_client') && (
          <span className="text-sm" style={{ color: colors.$21 }}>
            |
          </span>
        )}

        {(hasPermission('view_client') || hasPermission('edit_client')) && (
          <Link
            className="font-medium"
            to={route('/clients/:id', { id: client?.id || clientId })}
          >
            {t('view')}
          </Link>
        )}
      </div>
    </div>
  );
}
