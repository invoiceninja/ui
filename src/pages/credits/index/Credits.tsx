/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { CustomBulkAction, DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Default } from '$app/components/layouts/Default';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { useTranslation } from 'react-i18next';
import { MdPrint } from 'react-icons/md';
import {
  defaultColumns,
  useActions,
  useAllCreditColumns,
  useCreditColumns,
} from '../common/hooks';
import { permission } from '$app/common/guards/guards/permission';
import { Credit } from '$app/common/interfaces/credit';

export default function Credits() {
  useTitle('credits');

  const [t] = useTranslation();

  const pages = [{ name: t('credits'), href: '/credits' }];

  const actions = useActions();
  const columns = useCreditColumns();

  const printPdf = usePrintPdf({ entity: 'credit' });

  const creditColumns = useAllCreditColumns();

  const customBulkActions: CustomBulkAction<Credit>[] = [
    (selectedIds) => (
      <DropdownElement
        onClick={() => printPdf(selectedIds)}
        icon={<Icon element={MdPrint} />}
      >
        {t('print_pdf')}
      </DropdownElement>
    ),
  ];

  return (
    <Default
      title={t('credits')}
      breadcrumbs={pages}
      docsLink="en/credits/"
      withoutBackButton
    >
      <DataTable
        resource="credit"
        endpoint="/api/v1/credits?include=client&sort=id|desc"
        bulkRoute="/api/v1/credits/bulk"
        columns={columns}
        linkToCreate="/credits/create"
        linkToEdit="/credits/:id/edit"
        customActions={actions}
        customBulkActions={customBulkActions}
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={creditColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="credit"
          />
        }
        linkToCreateGuards={[permission('create_credit')]}
      />
    </Default>
  );
}
