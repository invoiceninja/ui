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
import { useTranslation } from 'react-i18next';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { useTableColumns } from './common/hooks/useTableColumns';
import { EditBlueprintModal } from './edit/components/EditBlueprintModal';
import { useState } from 'react';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useDocuNinjaActions } from '$app/common/hooks/useDocuNinjaActions';
import { useActions } from './common/hooks/useActions';

export default function Blueprints() {
  useTitle('blueprints');
  
  const [t] = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);

  const columns = useTableColumns();
  
  // Get token from unified actions (NO QUERY!)
  const { getToken } = useDocuNinjaActions();

  const handleSettingsClick = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedBlueprint(null);
  };

  // Extract custom actions using the hook
  const customActions = useActions({
    onSettingsClick: handleSettingsClick,
  });

  const pages = [
    {
      name: t('documents'),
      href: '/documents',
    },
    {
      name: t('templates'),
      href: '/documents/blueprints',
    },
  ];

  return (
    <Default title={t('templates')} breadcrumbs={pages}>
      <DataTable<Blueprint>
        resource="template"
        endpoint="/api/blueprints?sort=id|desc"
        columns={columns}
        withResourcefulActions
        bulkRoute="/api/blueprints/bulk"
        linkToCreate="/documents/templates/create"
        linkToEdit="/documents/templates/:id/edit"
        useDocuNinjaApi
        endpointHeaders={{
          Authorization: `Bearer ${getToken()}`,
        }}
        totalPagesPropPath="data.meta.last_page"
        totalRecordsPropPath="data.meta.total"
        withoutActionBulkPayloadPropertyForDeleteAction
        withoutIdsBulkPayloadPropertyForDeleteAction
        useDeleteMethod
        deleteBulkRoute="/api/blueprints/bulk"
        filterParameterKey="search"
        onBulkActionSuccess={() => {
          $refetch(['blueprints']);
        }}
        customActions={customActions}
      />

      {selectedBlueprint && (
        <EditBlueprintModal
          blueprint={selectedBlueprint}
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </Default>
  );
}
