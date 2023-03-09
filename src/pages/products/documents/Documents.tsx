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
import { route } from '$app/common/helpers/route';
import { useProductQuery } from '$app/common/queries/products';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

export function Documents() {
  const { id } = useParams();
  const { data: product } = useProductQuery({ id });

  const queryClient = useQueryClient();

  const invalidateQuery = () => {
    queryClient.invalidateQueries(route('/api/v1/products/:id', { id }));
  };

  return (
    <>
      <Upload
        endpoint={endpoint('/api/v1/products/:id/upload', { id })}
        onSuccess={invalidateQuery}
      />

      {product?.data.data && (
        <DocumentsTable
          documents={product.data.data.documents}
          onDocumentDelete={invalidateQuery}
        />
      )}
    </>
  );
}
