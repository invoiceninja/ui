/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
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
import { PaymentTerm } from 'common/interfaces/payment-term';
import { usePaymentTermsQuery } from 'common/queries/payment-terms';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function PaymentTerms() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('payment_terms')}`;
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');
  const [sort, setSort] = useState<string | undefined>(undefined);

  const { data } = usePaymentTermsQuery({ currentPage, perPage, sort });

  const archive = () => {};

  return (
    <Settings title={t('payment_terms')}>
      <div className="flex justify-end mt-8">
        <Button to="/settings/payment_terms/create">
          {t('new_payment_term')}
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
                <Td>{paymentTerm.name}</Td>
                <Td>
                  <Dropdown label={t('actions')}>
                    <DropdownElement
                      to={generatePath('/settings/payment_terms/:id', {
                        id: paymentTerm.id,
                      })}
                    >
                      {t('edit_payment_term')}
                    </DropdownElement>
                    <DropdownElement>
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
          totalPages={data.data.meta.total_pages}
        />
      )}
    </Settings>
  );
}
