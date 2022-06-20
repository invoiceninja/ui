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
import { DocumentsTable } from 'components/DocumentsTable';
import { Upload } from 'pages/settings/company/documents/components';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import { useCurrentCredit } from '../hooks/useCurrentCredit';

export function CreditDocuments() {
  const { id } = useParams();

  const credit = useCurrentCredit();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries(generatePath('/api/v1/credits/:id', { id }));
  };

  return (
    <>
      <Upload
        widgetOnly
        endpoint={endpoint('/api/v1/credits/:id/upload', { id })}
        onSuccess={onSuccess}
      />

      <DocumentsTable
        documents={credit?.documents || []}
        onDocumentDelete={onSuccess}
      />
    </>
  );
}
