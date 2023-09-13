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
import { MergeClientModal } from '../common/components/MergeClientModal';
import { useState } from 'react';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { usePurgeClient } from '../common/hooks/usePurgeClient';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';

export default function Clients() {
  useTitle('clients');

  const [t] = useTranslation();

  const pages: Page[] = [{ name: t('clients'), href: '/clients' }];

  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);
  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const [mergeFromClientId, setMergeFromClientId] = useState<string>('');
  const [purgeClientId, setPurgeClientId] = useState<string>('');

  const actions = useActions({
    setIsMergeModalOpen,
    setMergeFromClientId,
    setPasswordConfirmModalOpen,
    setPurgeClientId,
  });

  const columns = useClientColumns();
  const clientColumns = useAllClientColumns();
  const handlePurgeClient = usePurgeClient(purgeClientId);

  const customBulkActions = useCustomBulkActions();

  return (
    <Default
      breadcrumbs={pages}
      title={t('clients')}
      docsLink="en/clients"
      withoutBackButton
    >
      <DataTable
        resource="client"
        endpoint="/api/v1/clients?include=gateway_tokens,activities,ledger,system_logs,documents&sort=id|desc"
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
      />

      <MergeClientModal
        visible={isMergeModalOpen}
        setVisible={setIsMergeModalOpen}
        mergeFromClientId={mergeFromClientId}
      />

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={handlePurgeClient}
      />
    </Default>
  );
}
