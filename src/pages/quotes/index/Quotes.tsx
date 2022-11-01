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
import { Page } from 'components/Breadcrumbs';
import { DataTable } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { route } from 'common/helpers/route';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Download } from 'react-feather';
import {
  defaultColumns,
  quoteColumns,
  useActions,
  useQuoteColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';

export function Quotes() {
  const { documentTitle } = useTitle('quotes');
  const { t } = useTranslation();

  const pages: Page[] = [{ name: t('quotes'), href: route('/quotes') }];

  const importButton = (
    <ReactRouterLink to="/quotes/import">
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

  const columns = useQuoteColumns();
  const actions = useActions();

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="quote"
        columns={columns}
        endpoint="/api/v1/quotes?include=client"
        linkToEdit="/quotes/:id/edit"
        linkToCreate="/quotes/create"
        bulkRoute="/api/v1/quotes/bulk"
        customActions={actions}
        withResourcefulActions
        rightSide={importButton}
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={quoteColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="quote"
          />
        }
      />
    </Default>
  );
}
