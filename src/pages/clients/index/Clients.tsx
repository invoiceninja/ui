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
  defaultColumns,
  useAllClientColumns,
  useClientColumns,
} from '../common/hooks/useClientColumns';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { ImportButton } from 'components/import/ImportButton';
import { useActions } from '../common/hooks/useActions';
import { MergeClientModal } from '../common/components/MergeClientModal';
import { useState } from 'react';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { usePurgeClient } from '../common/hooks/usePurgeClient';

export function Clients() {
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
