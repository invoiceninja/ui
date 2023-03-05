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
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllCreditColumns,
  useCreditColumns,
} from '../common/hooks';

export function Credits() {
  useTitle('credits');

  const [t] = useTranslation();

  const pages = [{ name: t('credits'), href: '/credits' }];

  const actions = useActions();
  const columns = useCreditColumns();

  const creditColumns = useAllCreditColumns();

  return (
    <Default title={t('credits')} breadcrumbs={pages} docsLink="docs/credits/">
      <DataTable
        resource="credit"
        endpoint="/api/v1/credits?include=client"
        bulkRoute="/api/v1/credits/bulk"
        columns={columns}
        linkToCreate="/credits/create"
        linkToEdit="/credits/:id/edit"
        customActions={actions}
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={creditColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="credit"
          />
        }
      />
    </Default>
  );
}
