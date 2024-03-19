/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useAllClientColumns,
  useClientColumns,
} from '../common/hooks/useClientColumns';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { ImportButton } from '$app/components/import/ImportButton';
import { useActions } from '../common/hooks/useActions';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Client } from '$app/common/interfaces/client';

export default function Clients() {
  useTitle('clients');

  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  const pages: Page[] = [{ name: t('clients'), href: '/clients' }];

  const actions = useActions();
  const columns = useClientColumns();
  const clientColumns = useAllClientColumns();
  const customBulkActions = useCustomBulkActions();

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default
      breadcrumbs={pages}
      title={t('clients')}
      docsLink="en/clients"
      withoutBackButton
    >
      <DataTable
        resource="client"
        endpoint="/api/v1/clients?sort=id|desc"
        bulkRoute="/api/v1/clients/bulk"
        columns={columns}
        linkToCreate="/clients/create"
        linkToEdit="/clients/:id/edit"
        withResourcefulActions
        customActions={actions}
        customBulkActions={customBulkActions}
        rightSide={
          <Guard
            type="component"
            guards={[
              or(permission('create_client'), permission('edit_client')),
            ]}
            component={<ImportButton route="/clients/import" />}
          />
        }
        leftSideChevrons={
          <DataTableColumnsPicker
            table="client"
            columns={clientColumns as unknown as string[]}
            defaultColumns={defaultColumns}
          />
        }
        linkToCreateGuards={[permission('create_client')]}
        hideEditableOptions={!hasPermission('edit_client')}
      />

      <ChangeTemplateModal<Client>
        entity="client"
        entities={changeTemplateResources as Client[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(client) => `${t('number')}: ${client.number}`}
        bulkUrl="/api/v1/clients/bulk"
      />
    </Default>
  );
}
