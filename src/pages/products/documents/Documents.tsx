/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useProductQuery } from '$app/common/queries/products';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useParams } from 'react-router-dom';

export default function Documents() {
  const { id } = useParams();
  const { data: product } = useProductQuery({ id });

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const invalidateQuery = () => {
    $refetch(['products']);
  };

  return (
    <>
      <Upload
        endpoint={endpoint('/api/v1/products/:id/upload', { id })}
        onSuccess={invalidateQuery}
        disableUpload={
          !hasPermission('edit_product') && !entityAssigned(product?.data.data)
        }
      />

      {product?.data.data && (
        <DocumentsTable
          documents={product.data.data.documents}
          onDocumentDelete={invalidateQuery}
          disableEditableOptions={!entityAssigned(product.data.data, true)}
        />
      )}
    </>
  );
}
