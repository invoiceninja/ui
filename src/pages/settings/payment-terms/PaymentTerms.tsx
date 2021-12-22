/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, Link } from '@invoiceninja/forms';
import {
  ColumnSortPayload,
  Pagination,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@invoiceninja/tables';
import { AxiosError } from 'axios';
import { PaymentTerm } from 'common/interfaces/payment-term';
import { bulk, usePaymentTermsQuery } from 'common/queries/payment-terms';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { useState } from 'react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';

export function PaymentTerms() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('payment_terms')}`;
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');
  const [sort, setSort] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data } = usePaymentTermsQuery({
    currentPage,
    perPage,
    sort,
  });

  const archive = (id: string) => {
    toast.loading(t('processing'));

    bulk([id], 'archive')
      .then(() => {
        toast.dismiss();
        toast.success(t('archived_payment_term'));
      })
      .catch((error: AxiosError) => {
        toast.dismiss();
        toast.success(t('error_title'));

        console.error(error);
      })
      .finally(() => queryClient.invalidateQueries('/api/v1/payment_terms'));
  };

  return (
    <Settings title={t('payment_terms')}>
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
        <Tbody>
          {!data && (
            <Tr>
              <Td colSpan={2}>
                <Spinner />
              </Td>
            </Tr>
          )}

          {data &&
            data.data.data.map((paymentTerm: PaymentTerm) => (
              <Tr key={paymentTerm.id}>
                <Td>
                  <Link
                    to={generatePath('/settings/payment_terms/:id/edit', {
                      id: paymentTerm.id,
                    })}
                  >
                    {paymentTerm.name}
                  </Link>
                </Td>
                <Td>
                  <Dropdown label={t('actions')}>
                    <DropdownElement
                      to={generatePath('/settings/payment_terms/:id/edit', {
                        id: paymentTerm.id,
                      })}
                    >
                      {t('edit_payment_term')}
                    </DropdownElement>
                    <DropdownElement onClick={() => archive(paymentTerm.id)}>
                      {t('archive_payment_term')}
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
