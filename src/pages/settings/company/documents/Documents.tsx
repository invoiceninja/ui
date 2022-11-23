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
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useQueryClient } from 'react-query';
import { Table as DocumentsTable, Upload } from './components';

export function Documents() {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries('/api/v1/documents');
  };

  const company = useCurrentCompany();

  return (
    <>
      {company && (
        <Upload
          endpoint={endpoint('/api/v1/companies/:id/upload', {
            id: company.id,
          })}
          onSuccess={onSuccess}
        />
      )}
      <DocumentsTable />
    </>
  );
}
