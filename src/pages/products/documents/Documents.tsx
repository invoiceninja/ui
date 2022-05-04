/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Upload,
  Table as DocumentsTable,
} from 'pages/settings/company/documents/components';

export function Documents() {
  const apiEndpoint = 'api/v1/projects/:id/upload';

  return (
    <>
      <Upload apiEndpoint={apiEndpoint} />
      <DocumentsTable />
    </>
  );
}
