/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, Link } from '$app/components/forms';
import {
  ColumnSortPayload,
  Pagination,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '$app/components/tables';
import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { bulk, usePaymentTermsQuery } from '$app/common/queries/payment-terms';
import { Breadcrumbs } from '$app/components/Breadcrumbs';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Settings } from '$app/components/layouts/Settings';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdEdit } from 'react-icons/md';
import { useTitle } from '$app/common/hooks/useTitle';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';

export function PaymentTerms() {
  const { documentTitle } = useTitle('payment_terms');
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
    { name: t('payment_terms'), href: '/settings/payment_terms' },
  ];

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');
  const [sort, setSort] = useState<string | undefined>(undefined);

  const { data } = usePaymentTermsQuery({
    currentPage,
    perPage,
    sort,
  });

  const archive = (id: string) => {
    toast.processing();

    bulk([id], 'archive')
      .then(() => toast.success('archived_payment_term'))
      .finally(() => $refetch(['payment_terms']));
  };

  return (
    <Settings title={documentTitle}>
      <Breadcrumbs pages={pages} />

      <div className="flex justify-end">
        <Button to="/settings/payment_terms/create">
          <span>{t('new_payment_term')}</span>
        </Button>
      </div>

      <Table>
        <Thead>
          <Th
            isCurrentlyUsed={sort?.split('|')[0] === 'name'}
            id="name"
            onColumnClick={(data: ColumnSortPayload) => setSort(data.sort)}
          >
            {t('number_of_days')}
          </Th>
          <Th></Th>
        </Thead>
        <Tbody data={data} showHelperPlaceholders>
          {data &&
            data.data.data.map((paymentTerm: PaymentTerm) => (
              <Tr key={paymentTerm.id}>
                <Td>
                  <Link
                    to={route('/settings/payment_terms/:id/edit', {
                      id: paymentTerm.id,
                    })}
                  >
                    {paymentTerm.name}
                  </Link>
                </Td>
                <Td>
                  <Dropdown label={t('actions')}>
                    <DropdownElement
                      to={route('/settings/payment_terms/:id/edit', {
                        id: paymentTerm.id,
                      })}
                      icon={<Icon element={MdEdit} />}
                    >
                      {t('edit')}
                    </DropdownElement>

                    <DropdownElement
                      onClick={() => archive(paymentTerm.id)}
                      icon={<Icon element={MdArchive} />}
                    >
                      {t('archive')}
                    </DropdownElement>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>

      {data && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowsChange={setPerPage}
          totalPages={data.data.meta.pagination.total_pages}
        />
      )}
    </Settings>
  );
}
