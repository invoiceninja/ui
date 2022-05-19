/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useProductQuery } from 'common/queries/products';
import { DocumentsTable } from 'components/DocumentsTable';
import { Upload } from 'pages/settings/company/documents/components';
import { useParams } from 'react-router-dom';

export function Documents() {
  const { id } = useParams();
  const { data: product } = useProductQuery({ id });

  return (
    <>
      <Upload apiEndpoint="/api/v1/projects/:id/upload" />

      {product?.data.data && (
        <DocumentsTable documents={product.data.data.documents} />
      )}
    </>
  );
}
