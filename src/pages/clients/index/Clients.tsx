/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Page } from 'components/Breadcrumbs';
import { DataTable } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  clientColumns,
  defaultColumns,
  useClientColumns,
} from '../common/hooks/useClientColumns';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { ImportButton } from 'components/import/ImportButton';
import { useActions } from '../common/hooks/useActions';

export function Clients() {
  useTitle('clients');

  const [t] = useTranslation();

  const pages: Page[] = [{ name: t('clients'), href: '/clients' }];

  const actions = useActions();

  const columns = useClientColumns();

  return (
    <Default breadcrumbs={pages} title={t('clients')} docsLink="docs/clients">
      <DataTable
        resource="client"
        endpoint="/api/v1/clients"
        columns={columns}
        linkToCreate="/clients/create"
        linkToEdit="/clients/:id/edit"
        withResourcefulActions
        customActions={actions}
        rightSide={<ImportButton route="/clients/import" />}
        leftSideChevrons={
          <DataTableColumnsPicker
            table="client"
            columns={clientColumns as unknown as string[]}
            defaultColumns={defaultColumns}
          />
        }
      />
    </Default>
  );
}
