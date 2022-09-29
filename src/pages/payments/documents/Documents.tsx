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
import { usePaymentQuery } from 'common/queries/payments';
import { DocumentsTable } from 'components/DocumentsTable';
import { Upload } from 'pages/settings/company/documents/components';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

export function Documents() {
  const { id } = useParams();
  const { data: payment } = usePaymentQuery({ id });

  const queryClient = useQueryClient();

  const invalidateQuery = () => {
    queryClient.invalidateQueries(route('/api/v1/payments/:id', { id }));
  };

  return (
    <>
      <Upload
        endpoint={endpoint('/api/v1/payments/:id/upload', { id })}
        onSuccess={invalidateQuery}
      />

      {payment?.data.data && (
        <DocumentsTable
          documents={payment.data.data?.documents ?? []}
          onDocumentDelete={invalidateQuery}
        />
      )}
    </>
  );
}
