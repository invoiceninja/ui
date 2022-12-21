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
import {
  defaultColumns,
  quoteColumns,
  useActions,
  useQuoteColumns,
  useQuoteFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { ImportButton } from 'components/import/ImportButton';

export function Quotes() {
  const { documentTitle } = useTitle('quotes');

  const [t] = useTranslation();

  const pages: Page[] = [{ name: t('quotes'), href: route('/quotes') }];

  const columns = useQuoteColumns();

  const actions = useActions();

  const filters = useQuoteFilters();

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
        customFilters={filters}
        customFilterQueryKey="client_status"
        customFilterPlaceholder="status"
        withResourcefulActions
        rightSide={<ImportButton route="/quotes/import" />}
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
