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
import { useTableColumns } from '../common/hooks/useTableColumns';
import { Document, DocumentStatus } from '$app/common/interfaces/docuninja/api';
import { Default } from '$app/components/layouts/Default';
import { Page } from '$app/components/Breadcrumbs';
import { Button } from '$app/components/forms';
import { useNavigate } from 'react-router-dom';
import { Gear } from '$app/components/icons/Gear';
import { DocumentCreationDropZone } from '../common/components/DocumentCreationDropZone';

export default function Blueprints() {
  useTitle('documents');

  const [t] = useTranslation();

  const navigate = useNavigate();

  const columns = useTableColumns();

  const pages: Page[] = [
    {
      name: t('documents'),
      href: '/documents',
    },
  ];

  return (
    <Default title={t('documents')} breadcrumbs={pages}>
      <div className="flex flex-col gap-y-4">
        <DocumentCreationDropZone />

        <DataTable<Document>
          queryIdentificator="/api/documents/docuninja"
          resource="document"
          endpoint="/api/documents?sort=id|desc"
          columns={columns}
          withResourcefulActions
          bulkRoute="/api/documents/bulk"
          linkToEdit="/documents/:id/builder"
          useDocuNinjaApi
          endpointHeaders={{
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          }}
          totalPagesPropPath="data.meta.last_page"
          totalRecordsPropPath="data.meta.total"
          withoutActionBulkPayloadPropertyForDeleteAction
          withoutIdsBulkPayloadPropertyForDeleteAction
          useDeleteMethod
          deleteBulkRoute="/api/documents/:id"
          rightSide={
            <Button
              behavior="button"
              type="secondary"
              onClick={() => navigate('/documents/settings')}
            >
              <div className="flex items-center space-x-2">
                <div>
                  <Gear />
                </div>

                <span>{t('settings')}</span>
              </div>
            </Button>
          }
          showEdit={(document) =>
            document?.status_id !== DocumentStatus.Completed &&
            document?.status_id !== DocumentStatus.Voided
          }
          filterParameterKey="search"
        />
      </div>
    </Default>
  );
}
