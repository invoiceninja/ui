/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useVendorQuery } from 'common/queries/vendor';
import { DocumentsTable } from 'components/DocumentsTable';
import { Upload } from 'pages/settings/company/documents/components';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

export function Documents() {
  const { id } = useParams();
  const { data: vendor } = useVendorQuery({ id });

  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries(route('/api/v1/vendors/:id', { id }));
  };

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12 lg:col-span-4">
        <Upload
          endpoint={endpoint('/api/v1/vendors/:id/upload', { id })}
          onSuccess={onSuccess}
          widgetOnly
        />
      </div>

      <div className="col-span-12">
        <DocumentsTable
          documents={vendor?.documents || []}
          onDocumentDelete={onSuccess}
        />
      </div>
    </div>
  );
}
