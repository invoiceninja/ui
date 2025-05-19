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
import { endpoint } from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useVendorQuery } from '$app/common/queries/vendor';
import { Card } from '$app/components/cards';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function Documents() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();
  const { data: vendor } = useVendorQuery({ id });

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const onSuccess = () => {
    $refetch(['vendors']);
  };

  return (
    <Card
      title={t('documents')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div className="flex flex-col space-y-4 px-6 pt-4">
        <Upload
          endpoint={endpoint('/api/v1/vendors/:id/upload', { id })}
          onSuccess={onSuccess}
          widgetOnly
          disableUpload={
            !hasPermission('edit_vendor') && !entityAssigned(vendor)
          }
        />

        <DocumentsTable
          documents={vendor?.documents || []}
          onDocumentDelete={onSuccess}
          disableEditableOptions={
            !entityAssigned(vendor, true) && !hasPermission('edit_vendor')
          }
        />
      </div>
    </Card>
  );
}
