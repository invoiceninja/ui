/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { useTitle } from 'common/hooks/useTitle';
import { ApiToken } from 'common/interfaces/api-token';
import { Link } from '@invoiceninja/forms';
import { route } from 'common/helpers/route';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';

export function ApiTokens() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('api_tokens');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    {
      name: t('api_tokens'),
      href: '/settings/integrations/api_tokens',
    },
  ];

  const columns: DataTableColumns<ApiToken> = [
    {
      id: 'name',
      label: t('name'),
      format: (field, apiToken) => (
        <Link
          to={route('/settings/integrations/api_tokens/:id/edit', {
            id: apiToken?.id,
          })}
        >
          {apiToken?.name}
        </Link>
      ),
    },
    {
      id: 'created_at',
      label: t('created_on'),
      format: (field, apiToken) => date(apiToken.created_at, dateFormat),
    },
  ];

  return (
    <Settings title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="token"
        columns={columns}
        endpoint="/api/v1/tokens"
        linkToCreate="/settings/integrations/api_tokens/create"
        linkToEdit="/settings/integrations/api_tokens/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
