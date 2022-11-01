/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { DataTable } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Download } from 'react-feather';
import { useActions } from '../edit/components/Actions';
import {
  defaultColumns,
  invoiceColumns,
  useInvoiceColumns,
} from '../common/hooks/useInvoiceColumns';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';

export function Invoices() {
  const { documentTitle } = useTitle('invoices');
  const { t } = useTranslation();

  const pages = [{ name: t('invoices'), href: '/invoices' }];

  const importButton = (
    <ReactRouterLink to="/invoices/import">
      <button className="inline-flex items-center justify-center py-2 px-4 rounded text-sm text-white bg-green-500 hover:bg-green-600">
        <svg
          className="w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="3 3 20 20"
        >
          <Download />
        </svg>
        <span>{t('import')}</span>
      </button>
    </ReactRouterLink>
  );

  const columns = useInvoiceColumns();
  const actions = useActions();

  return (
    <Default title={documentTitle} breadcrumbs={pages} docsLink="docs/invoices">
      <DataTable
        resource="invoice"
        endpoint="/api/v1/invoices?include=client&without_deleted_clients=true"
        columns={columns}
        bulkRoute="/api/v1/invoices/bulk"
        linkToCreate="/invoices/create"
        linkToEdit="/invoices/:id/edit"
        withResourcefulActions
        customActions={actions}
        rightSide={importButton}
        leftSideChevrons={
          <DataTableColumnsPicker
            table="invoice"
            columns={invoiceColumns as unknown as string[]}
            defaultColumns={defaultColumns}
          />
        }
      />
    </Default>
  );
}
