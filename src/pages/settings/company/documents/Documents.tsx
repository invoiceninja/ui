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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Table as DocumentsTable, Upload } from './components';
import { $refetch } from '$app/common/hooks/useRefetch';

export function Documents() {
  const onSuccess = () => {
    $refetch(['documents']);
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
